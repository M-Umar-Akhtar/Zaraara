# app.py
from dotenv import load_dotenv
load_dotenv()
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from graph import chat_graph
import uuid
CORS_ORIGIN = os.getenv("CORS_ORIGIN")

app = Flask(__name__)

# ✅ Enable CORS
CORS(
    app,
    resources={r"/api/*": {"origins": CORS_ORIGIN}},
    supports_credentials=True
)

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")
    auth_token = data.get("authToken")
    
    if not auth_token:
        auth_token = ""
    #print("Auth_token",auth_token)
    # Get user_id from request or generate one
    # You can use session, JWT token, or cookies to track users
    user_id = data.get("user_id", "default_user")
    
    # Prepare state
    initial_state = {
        "user_id": user_id,
        "user_message": user_message,
        "product_filters": [],
        "order_filters": [],
        "product_reply": "",
        "order_reply": "",
        "products": [],
        "orders": [],
        "response": [],
        "authToken": auth_token 
    }
    
    # IMPORTANT: Config must include thread_id for checkpointer
    config = {"configurable": {"thread_id": user_id}}
    
    try:
        # Invoke the graph with config
        result = chat_graph.invoke(initial_state, config=config)
        #print("App results: ",result)
        response_list = result.get("response", [])
        print("Final Response: ",response_list)
        return jsonify({
            "responses": response_list,
            "filters": result.get("filters", [])
        })
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({
            "responses": [{
                "type": "text",
                "message": "I'm having trouble processing your request right now. Please try again."
            }],
            "error": str(e)
        }), 500

@app.route("/api/chat/clear", methods=["POST"])
def clear_chat():
    """Clear conversation history for a user"""
    data = request.json
    user_id = data.get("user_id", "default_user")
    
    try:
        from graph import memory
        memory.clear_history(user_id)
        return jsonify({"message": "Chat history cleared successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)