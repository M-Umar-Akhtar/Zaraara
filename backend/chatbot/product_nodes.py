# =========================================================
# NODE 1 — FILTER EXTRACTION
# =========================================================
def extract_filters(state: ChatState) -> ChatState:
    prompt = f"""
You are an AI that extracts shopping filters for a database query.

The database has these product fields:
- q (name of the product)
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
        
        content = res.choices[0].message.content.strip()
        print("Grok response:", content)

        if content.startswith("```"):
            content = content.split("```")[1]

        parsed = json.loads(content)
        if isinstance(parsed, dict):
            parsed = [parsed]

        clean_filters = []
        for f in parsed:
            if isinstance(f, dict):
                clean = {k: v for k, v in f.items() if v not in [None, "", "null"]}
                if clean:
                    clean_filters.append(clean)

        filters = clean_filters
        print("Filters: ",filters)
    except Exception as e:
        print("Filter extraction error:", e)
        filters = {}

    return {**state, "filters": filters}

# =========================================================
# NODE 2 — FETCH PRODUCTS FROM BACKEND
# =========================================================
def fetch_products(state: ChatState) -> ChatState:
    raw_filters = state.get("filters", [])
    all_products = []

    for f in raw_filters:
        try:
            on_sale_requested = f.pop("on_sale", None)
            print("Params f: ",f)
            print("URL: ",f"{BACKEND_URL}/products",f)
            res = requests.get(f"{BACKEND_URL}/products", params=f, timeout=5)
            print("Res Items: ",res.json().get("items"))
            res.raise_for_status()
            items = res.json().get("items",[])
            if on_sale_requested:
                items = [p for p in items if p.get("sale")]
            all_products.extend(items)
            print("Items: ",all_products)
        except Exception as e:
            print("Backend API error:", e)

    return {**state, "products": all_products}


# =========================================================
# NODE 3 — GENERATE RESPONSE
# =========================================================
def generate_response(state: ChatState) -> ChatState:
    user_id = state.get("user_id", "user_123")
    user_msg = state["user_message"]
    products = state.get("products", [])

    history = get_memory(user_id)

    if not products:
        reply = "I couldn’t find an exact match. Want me to suggest something similar?"
    else:
        context = "\n".join(
            f"- {p['name']} (Rs {p['price']}) | Colors: {', '.join(p.get('colors', []))} | Sizes: {', '.join(p.get('sizes', []))}"
            for p in products[:5]
        )

        prompt = f"""
        You are a shopping assistant.

You MUST ONLY use the products listed below.
If the product is not listed, say it is unavailable.
DO NOT invent products.
DO NOT suggest items not in the list.
Conversation history:
{history}

User: "{user_msg}"

Products found:
{context}

Reply like a helpful shopping assistant.
"""

        res = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )

        reply = res.choices[0].message.content

    add_memory(user_id, "User", user_msg)
    add_memory(user_id, "Assistant", reply)

    return {**state, "response": reply}