# graph.py
from io import BytesIO
import time
import base64
from PIL import Image
from rapidfuzz import process, fuzz
import operator
from typing import TypedDict, List, Optional
from typing_extensions import Annotated
from langgraph.graph import StateGraph, END
import os
import json
import requests
from openai import OpenAI  # Used only as Groq-compatible client

# =========================================================
# CONFIG
# =========================================================
GROQ_API_KEY = os.getenv("GROK_API_KEY")
BACKEND_URL = os.getenv("NODE_BACKEND_URL")
TRY_ON_API_KEY = os.getenv("TRY_ON_API_KEY")
print("GROQ KEY FOUND:", GROQ_API_KEY is not None)
print("TRY_ON_API_KEY:", TRY_ON_API_KEY is not None)

# Groq uses OpenAI-compatible SDK
client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

def overwrite(_, new):
    return new

def merge_dict(prev: dict, new: dict) -> dict:
    """
    Merge two dictionaries. For keys that exist in both:
    - If the value is a list, extend the list
    - Otherwise, overwrite
    """
    if not prev:
        prev = {}
    if not new:
        new = {}
    if prev == new:
        return prev
    
    merged = prev.copy()
    for k, v in new.items():
        if k in merged and isinstance(merged[k], list) and isinstance(v, list):
            merged[k].extend(v)
        else:
            merged[k] = v
    return merged

# =========================================================
# STATE
# =========================================================
class ChatState(TypedDict):
    # Annotated keys for parallel merging
    user_id: Annotated[str, overwrite]
    user_message: Annotated[str, overwrite]
    
    # INTENT FLAGS
    chat: Annotated[bool, overwrite]
    tryon: Annotated[bool, overwrite]
    product_intent: Annotated[bool, overwrite]
    order_intent: Annotated[bool, overwrite]

    # TRYON STATES
    product_name: Annotated[str, overwrite]
    uploaded_image: Annotated[bytes, overwrite]  # store image bytes
    generated_image: Annotated[str, overwrite]
    tryon_error: Annotated[str, overwrite]
 
    # CHAT STATES
    # PRODUCT PIPELINE
    product_filters: Annotated[Optional[List[dict]], operator.add]
    products: Annotated[Optional[List[dict]], operator.add]
    product_reply: Annotated[dict, merge_dict]
    category: Annotated[str, overwrite]

    # ORDER PIPELINE
    order_filters: Annotated[Optional[List[dict]], operator.add]
    orders: Annotated[Optional[List[dict]], operator.add]
    login_required: Annotated[bool, operator.add]
    order_reply: Annotated[dict, merge_dict]

    # AUTH
    authToken: Annotated[str, overwrite]

    # FINAL
    response: Annotated[Optional[List[dict]], overwrite]

    #NEXT NODES
    _next_nodes: Annotated[Optional[List[str]], overwrite]
    chat_next_nodes: Annotated[Optional[List[str]], overwrite]

# =========================================================
# NODE 1 — FILTER EXTRACTION
# =========================================================
def extract_product_filters(state: ChatState) -> ChatState:
    prompt = f"""
You are an AI that extracts shopping filters for a database query.

The database has these product fields:
- q (name of the product i:e shirt, suit, dress, kurta, kurti)
- category (one of: women, men, kids, accessories, fragrances)
- price (integer)
- sale (true/false)
- colors (color options)
- sizes (size options)
- fabric (cloth material)

Your job:
Convert the user message into FILTERS for these fields.

STRICT RULES:
1. Return ONLY valid JSON.
2. Do NOT invent new fields.
3. If information is missing, use null.
4. category MUST be one of:
   ["women","men","kids","accessories","fragrances"]
5. maxPrice should be extracted from phrases like:
   "under 3000", "less than 5000", "max 2000"
6. on_sale = true only if user mentions sale, discount, offer.


User message: "{state['user_message']}"
"""

    try:
        res = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        #print("User message: ",state['user_message'])
        #print("res: ",res)
        content = res.choices[0].message.content.strip()
        print("Grok Product response:", content)
        
        if content.startswith("```"):
            content = content.split("```")[1]

        parsed = json.loads(content)
        #print("parsed['category']: ",parsed['category'])
        state['category'] = parsed['category']
        if isinstance(parsed, dict):
            parsed = [parsed]

        clean_filters = []
        for f in parsed:
            if isinstance(f, dict):
                clean = {k: v for k, v in f.items() if v not in [None, "", "null"]}
                if clean:
                    clean_filters.append(clean)

        filters = clean_filters
        #print("Filters: ",filters)
    except Exception as e:
        print("Filter extraction error:", e)
        filters = []

    return {**state, "product_filters": filters or []}

# =========================================================
# NODE 2 — FETCH PRODUCTS FROM BACKEND
# =========================================================
def fetch_products(state: ChatState) -> ChatState:
    #print("fetch_products")
    raw_filters = state.get("product_filters", [])
    all_products = []

    for f in raw_filters:
        try:
            on_sale_requested = f.pop("on_sale", None)
            #print("Params f: ",f)
            #print("URL: ",f"{BACKEND_URL}/products",f)
            res = requests.get(f"{BACKEND_URL}/products", params=f, timeout=5)
            res.raise_for_status()
            items = res.json().get("items",[])
            #print("ITEMS: ",items)
            if on_sale_requested:
                items = [p for p in items if p.get("sale")]
            all_products.extend(items)
            #print("Items: ",all_products)
        except Exception as e:
            print("Backend API error:", e)

    return {**state, "products": all_products or []}


# =========================================================
# NODE 3 — GENERATE RESPONSE
# =========================================================
def generate_product_response(state: ChatState) -> ChatState:
    #print("generate_product_response")

    category = state["category"]
    user_msg = state["user_message"]
    products = state.get("products", [])
    alt_products = []

    # CASE 1 — No products found → use LLM to talk
    if not products:
        #print("IN if not products")
        if category:
            #print("IN if category")
            try:
                res = requests.get(f"{BACKEND_URL}/products?category={category}", timeout=5)
                res.raise_for_status()
                alt_products = res.json().get("items", [])
            except Exception as e:
                print("Error fetching category products:", e)
                alt_products = []

            # 3. Prepare prompt for LLM
            prompt = f"""
        You are a helpful shopping assistant.

        User: "{user_msg}"

        We don't have the exact product the user requested.
        - Suggested products in the same category: {alt_products if alt_products else 'None'}
        - If products are not avialable suggest other categories one of: ["women","men","kids","accessories","fragrances"]
        Write a friendly, short message to the user explaining this.
        """
            res = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4
            )
            reply = res.choices[0].message.content.strip()

            if alt_products:
                return {
                    **state,
                    "product_reply": {
                        "type": "products",
                        "data": alt_products,  # may be empty
                        "message": reply
                    }
                }
            else:
                return {
                    **state,
                    "product_reply": {
                        "type": "error",
                        "data": [], 
                        "message": reply
                    }
                }

    # CASE 2 — Products found → SEND STRUCTURED DATA
    else:
        # Trim to what frontend needs (important!)
        cleaned_products = [
            {
                "id": p["id"],
                "name": p["name"],
                "price": p["price"],
                "originalPrice": p.get("originalPrice", p["price"]),
                "image": p.get("image"),
                "sale": p.get("sale", False),
                "discount": p.get("discount", 0),
                "fabric": p.get("fabric", "Premium Fabric"),
                "colors": p.get("colors", []),
                "sizes": p.get("sizes", [])
            }
            for p in products[:8]
        ]

        product_context = "\n".join(
            f"- {p['name']} (Rs {p['price']}) | Colors: {', '.join(p.get('colors', []))} | Sizes: {', '.join(p.get('sizes', []))}"
            for p in cleaned_products
        )

        prompt = f"""
        You are a helpful shopping assistant.

        User asked: "{user_msg}"

        You have the following products available:
        {product_context}

        Write a short, friendly message introducing these products. Mention any filters like price, occasion, or color if relevant.
        Do NOT list the products here (frontend will render them).
        Also tell the user that they can click on the products listed below to view details
        Keep it under 40 words.
        """
        res = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4
        )

        intro_message = res.choices[0].message.content.strip()

        return {
            **state,
            "product_reply": {
                "type": "products",
                "data": cleaned_products,
                "message": intro_message
            }
        }


# =========================================================
# NODE — EXTRACT ORDER FILTERS
# =========================================================
def extract_order_filters(state: ChatState) -> ChatState:
    """
    Parse the user message and extract structured filters for orders.
    Can detect:
    - Specific order by order number
    - Request for all orders for the current user
    - Optional fields requested (status, shipping address, items, etc.)
    """

    prompt = f"""
You are an AI assistant specialized in order queries.

You have two types of queries:
1. Specific order: the user provides an order number.
2. All orders: the user asks to see all of their orders.

Fields you can return:
- orderNumber (string)  # only if user asks about a specific order
- all_orders (boolean)   # True if user asks for all orders
- fields (list of strings)  # Optional: user requested info (status, shippingAddress, items, total, createdAt)

STRICT RULES:
- Return ONLY valid JSON.
- Use null for values you cannot determine.
- Do not invent orders or order numbers.
- If user asks for a specific detail, include it in fields.

User message: "{state['user_message']}"
"""

    try:
        res = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        content = res.choices[0].message.content.strip()
        print("Grok order response:", content)

        if content.startswith("```"):
            content = content.split("```")[1]

        parsed = json.loads(content)

        # HANDLE BOTH CASES
        if isinstance(parsed, dict):
            parsed = [parsed]

        clean_filters = []
        for f in parsed:
            if isinstance(f, dict):
                # remove nulls or empty strings
                clean = {k: v for k, v in f.items() if v not in [None, "", "null"]}
                if clean:
                    clean_filters.append(clean)

        filters = clean_filters
        #print("Order Filters: ", filters)

    except Exception as e:
        print("Order filter extraction error:", e)
        filters = []

    return {**state, "order_filters": filters or {}}

# =========================================================
# NODE — FETCH ORDERS
# =========================================================
def fetch_orders(state: ChatState) -> ChatState:
    #print("fetch_orders")
    raw_filters = state.get("order_filters", [])
    #print("Order raw_filters: ", raw_filters)

    all_orders = []
    login_required = True
    # Prepare headers with auth token if present
    headers = {}
    auth_token = state.get("authToken")
    
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
        login_required = False
    if not login_required:
        #print("IN if not login_required:")
        for f in raw_filters:
            #print("IN for f in raw_filters:")
            try:
                #print("HEADERS BEING SENT:", headers)
                if "orderNumber" in f:
                    # Fetch a specific order
                    order_number = f["orderNumber"]
                    url = f"{BACKEND_URL}/orders/{order_number}"
                    res = requests.get(url, headers=headers, timeout=5)
                    res.raise_for_status()
                    order = res.json().get("order")
                    if order:
                        all_orders.append(order)

                elif f.get("all_orders"):
                    # Fetch all orders for the user
                    url = f"{BACKEND_URL}/me/orders"
                    res = requests.get(url, headers=headers, timeout=5)
                    res.raise_for_status()
                    orders = res.json().get("orders", [])
                    all_orders.extend(orders)

                else:
                    print("No valid order filter found:", f)

            except Exception as e:
                print("Backend API error (orders):", e)
        #print("all_orders: ",all_orders)
        return {**state, "orders": all_orders,"login_required": login_required}
    
    return {**state, "orders": [],"login_required": login_required}

# =========================================================
# NODE — GENERATE ORDER RESPONSE
# =========================================================
def generate_order_response(state: ChatState) -> ChatState:
    user_msg = state["user_message"]
    orders = state.get("orders", [])
    login_required = state.get("login_required")

    # Case 1 — Not logged in
    if login_required:
        return {
            **state,
            "order_reply": {
                "type": "error",
                "data": [],
                "message": "You need to login first to view your orders."
            }
        }

    # Case 2 — No orders
    if not orders:
        return {
            **state,
            "order_reply": {
                "type": "orders",
                "data": [],
                "message": "I couldn't find any orders in your account."
            }
        }

    cleaned_orders = []
    for order in orders:
        address_parts = [
            order.get("shipLine1"),
            order.get("shipLine2"),
            order.get("shipCity"),
            order.get("shipState"),
            order.get("shipPostal"),
            order.get("shipCountryCode"),
        ]

        cleaned_orders.append({
            "orderNumber": order.get("orderNumber"),
            "status": order.get("status"),
            "subtotal": order.get("subtotal"),
            "discount": order.get("discount"),
            "shipping": order.get("shipping"),
            "total": order.get("total"),
            "shippingAddress": ", ".join([a for a in address_parts if a]),
            "placedAt": order.get("createdAt"),
            "items": [
                {
                    "productId": item.get("productId"),
                    "quantity": item.get("quantity"),
                    "price": item.get("unitPrice"),
                    "size": item.get("selectedSize"),
                    "color": item.get("selectedColor")
                }
                for item in order.get("items", [])
            ]
        })

   
    prompt = f"""
User asked: "{user_msg}"

You have {len(cleaned_orders)} orders.

Write a short friendly sentence introducing the order list.
Do NOT list order details.
Keep under 20 words.
"""

    res = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4
    )

    intro = res.choices[0].message.content.strip()

    return {
        **state,
        "order_reply": {
            "type": "orders",
            "data": cleaned_orders,
            "message": intro
        }
    }


# ------------------- SUPER NODE -------------------
def super_node(state: ChatState) -> ChatState:
    return state

def tryon_node(state: ChatState) -> ChatState:
    print("tryon_node started")

    user_input = state.get("product_name")
    user_image_file = state.get("uploaded_image")

    if not user_input or not user_image_file:
        state["tryon_error"] = "Missing image or product name."
        return state

    # ------------------ Correct product name ------------------
    COMMON_PRODUCTS = [
        "premium suit", "classic kurta", "silk dress",
        "casual shirt", "formal shalwar"
    ]

    match, score, _ = process.extractOne(
        user_input.lower(),
        COMMON_PRODUCTS,
        scorer=fuzz.token_sort_ratio
    )
    corrected_name = match if score > 70 else user_input
    print("Corrected product:", corrected_name)

    # ------------------ Fetch product ------------------
    try:
        res = requests.get(f"{BACKEND_URL}/products", params={"q": corrected_name}, timeout=5)
        res.raise_for_status()
        products = res.json().get("items", [])

        if not products:
            state["tryon_error"] = "Product not found."
            return state

        product = products[0]

        # Get product image and metadata
        product_image_url = product.get("image")
        print("product_image_url: ",product_image_url)
        if not product_image_url:
            state["tryon_error"] = "Product image missing."
            return state

        # Download product image
        product_res = requests.get(product_image_url, timeout=5)
        product_res.raise_for_status()
        product_bytes = product_res.content
        print("product_bytes: ",product_bytes)
        img = Image.open(BytesIO(product_bytes))
        print("PRODUCT FORMAT:", img.format)
        print("PRODUCT MODE:", img.mode)
        print("PRODUCT SIZE:", img.size)
    except Exception as e:
        state["tryon_error"] = f"Product fetch error: {e}"
        return state

    try:
        headers = {"Authorization": f"Bearer {TRY_ON_API_KEY}"}
        files = {
            "person_images": BytesIO(user_image_file),
            "garment_images": BytesIO(product_bytes)
        }

        # Submit job
        response = requests.post(
            "https://tryon-api.com/api/v1/tryon",  # <-- real endpoint
            headers=headers,
            files=files
        )
        response.raise_for_status()
        data = response.json()
        job_id = data["jobId"]
        status_url = data["statusUrl"]

        print(f"Try-On job submitted: {job_id}")

        # Poll for completion with timeout
        job_status = "processing"
        result_b64 = None
        result_url = None
        poll_start = time.time()
        timeout_seconds = 120  # max 2 minutes to wait
        print("Waiting 30 seconds for the job to start processing...")
        time.sleep(30)
        while True:
            status_response = requests.get(f"https://tryon-api.com{status_url}", headers=headers)
            status_response.raise_for_status()
            status_data = status_response.json()

            #print("Try on data: ", status_data)
            job_status = status_data.get("status")

            if job_status == "completed":
                # Try to get base64 first, fallback to imageUrl
                result_b64 = status_data.get("imageBase64")
                result_url = status_data.get("imageUrl")
                break

            elif job_status in ["failed", "invalid_input"]:
                raise Exception(f"Try-On job failed: {status_data.get('error')}")
            
            else:
                print("Waiting 30 secs, Job Status: ",job_status)
                time.sleep(30)

        # Fetch image
        if result_b64:
            state["generated_image"] = result_b64
        elif result_url:
            image_res = requests.get(result_url)
            image_res.raise_for_status()
            state["generated_image"] = base64.b64encode(image_res.content).decode("utf-8")
        else:
            raise Exception("Try-On job did not return an image or URL.")

        print("Try-On image generated successfully.")


    except Exception as e:
        state["tryon_error"] = f"Image Generation error: {e}"

    return state

def chat_node(state: ChatState) -> ChatState:
    user_msg = state["user_message"].lower()
    state["product_intent"] = state["order_intent"] = False

    # --- Keyword approach ---
    product_keywords = [
        "product", "buy", "price", "cost", "item", "category",
        "men", "women", "kids", "accessories", "fragrance", "perfume",
        "shirt", "kurta", "kurti", "dress", "suit", "shalwar",
        "handbag", "shawl", "dupatta", "luxury", "casual",
        "red", "blue", "green", "black", "white", "gold", "purple", "navy", "pink", "maroon",
        "small", "medium", "large", "xl", "xs", "xxl", "one size",
        "cotton", "silk", "wool", "leather", "cotton blend", "premium silk", "oxford cotton",
        "recommend", "available","cloth","cloths","clothing"
    ]
    order_keywords = [
        "order", "my orders", "status", "track", "tracking", "delivery", "shipped",
        "delivered", "cancel", "order number", "invoice", "receipt", "shipment",
        "pending", "failed", "return", "exchange", "refund"
    ]

    product_intent = any(k in user_msg for k in product_keywords)
    order_intent = any(k in user_msg for k in order_keywords)
    print("Before loop Product_intent:", product_intent)
    print("Before loop Order_intent:", order_intent)
    # If both intents are False (ambiguous), ask the model
    if not (product_intent or order_intent):
        print("Inside loop")
        try:
            response = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                        {"role": "system", "content": "You are a helpful assistant that identifies user intents."},
                        {"role": "user", "content": f"Classify this message as product or order intent or both, for the response to have product intent the user would be asking regarding product information, for the order intent the user would be asking about order detials or information: '{state['user_message']}'"}
                    ],
                temperature=0.3
            )
            
            model_text = response.choices[0].message.content.strip().lower()
            print("model_text: ",model_text)
            # Simple logic based on model text
            if "product" in model_text:
                product_intent = True
            if "order" in model_text:
                order_intent = True

        except Exception as e:
            print("LLM intent detection error:", e)
            # fallback to keywords only

    # Store final intents
    state["product_intent"] = product_intent
    state["order_intent"] = order_intent

    print("After Product_intent:", product_intent)
    print("After Order_intent:", order_intent)

    return state

# -------------------     ROUTERS     -------------------
def super_node_router(state: ChatState) -> list[str]:
    next_nodes = []
    if state.get("chat"):
        next_nodes.append("chat_node")
    if state.get("tryon"):
        next_nodes.append("tryon_node")
    if not next_nodes:
        next_nodes.append("response_synthesizer")
    print("super next_nodes : ",next_nodes)
    return next_nodes

def chat_node_router(state: ChatState) -> list[str]:
    next_nodes = []
    if state.get("product_intent"):
        next_nodes.append("extract_product_filters")
    if state.get("order_intent"):
        next_nodes.append("extract_order_filters")
    if not next_nodes:
        next_nodes.append("response_synthesizer")
    print("chat next_nodes : ",next_nodes)
    return next_nodes
    
# ------------------- RESPONSE NODE -------------------
def chat_response_synthesizer(state: ChatState) -> ChatState:
    """
    Combines outputs from product and order pipelines.
    Returns a response list, preserving product dicts and order text.
    """
    #print("response_synthesizer")

    response_list = []
    print("order_reply: ",state["order_reply"])
    # Add product reply if available
    if state.get("product_intent") and state.get("product_reply"):
        response_list.append(state["product_reply"])  # already a dict

    # Add order reply if available
    if state.get("order_intent") and state.get("order_reply"):
        response_list.append(state["order_reply"])

    # Fallback if nothing is present
    if not response_list:
        response_list.append({
            "type": "error",
            "message": "We are experiencing technical difficulties please try again."
        })

    state["response"] = response_list
    print("Done, response list length:", len(response_list))
    return state


    # # Merge all responses
    # state["response"] = "\n\n".join(responses) if responses else "I'm not sure how to help with that."
    # print("Done")
    # return state

def tryon_response_node(state: ChatState) -> ChatState:
    if state.get("tryon_error"):
        state["response"] = [{
            "type": "error",
            "message": state["tryon_error"]
        }]
        return state

    img_base64 = state.get("generated_image")

    image_data_url = None
    if img_base64:
        image_data_url = f"data:image/png;base64,{img_base64}"

    state["response"] = [{
        "type": "tryon",
        "message": "Here's your virtual try-on result.",
        "resultImage": image_data_url
    }]

    return state


# ------------------- GRAPH CONSTRUCTION -------------------
graph = StateGraph(ChatState)

# ------------------- Nodes -------------------
graph.add_node("super_node", super_node)
graph.add_node("chat_node", chat_node)
graph.add_node("tryon_node", tryon_node)
graph.add_node("tryon_response_node",tryon_response_node)

# Product pipeline
graph.add_node("extract_product_filters", extract_product_filters)
graph.add_node("fetch_products", fetch_products)
graph.add_node("generate_product_response", generate_product_response)

# Order pipeline
graph.add_node("extract_order_filters", extract_order_filters)
graph.add_node("fetch_orders", fetch_orders)
graph.add_node("generate_order_response", generate_order_response)

# Response synthesizer
graph.add_node("chat_response_synthesizer", chat_response_synthesizer)

# ------------------- Edges -------------------
graph.set_entry_point("super_node")
graph.add_conditional_edges(
    "super_node",
    super_node_router,
    ["chat_node", "tryon_node"]
)

graph.add_edge("tryon_node", "tryon_response_node")
graph.add_edge("tryon_response_node", END)

graph.add_conditional_edges(
    "chat_node",
    chat_node_router,
    ["extract_product_filters", "extract_order_filters","chat_response_synthesizer"]
)

# Product pipeline
graph.add_edge("extract_product_filters", "fetch_products")
graph.add_edge("fetch_products", "generate_product_response")
graph.add_edge("generate_product_response", "chat_response_synthesizer")

# Order pipeline
graph.add_edge("extract_order_filters", "fetch_orders")
graph.add_edge("fetch_orders", "generate_order_response")
graph.add_edge("generate_order_response", "chat_response_synthesizer")

# Synthesizer to END
graph.add_edge("chat_response_synthesizer", END)

chat_graph = graph.compile()
