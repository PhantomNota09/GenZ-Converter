from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as genai
import traceback

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Keep the CORS configuration that works
CORS(app, origins="*", allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

# Verify GEMINI_API_KEY is set
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in .env file. Please set it.")
    GEMINI_API_KEY = "dummy_key_for_testing"

# A curated list of Gen Z slang for context (restored from original)
GEN_Z_SLANG_EXAMPLES = """
Key Gen Z Slang to consider:
Aura: Overall vibe, energy, or personality.
Basic: Someone who likes mainstream trends and products.
Beige flag: Neither positive nor negative personality traits.
BDE: Big dick energy; confidence without trying.
Bestie: Friend (often used ironically for strangers).
Bet: Okay, for sure, I agree.
Big yikes: Something extremely embarrassing or offensive.
Bop: An exceptionally good song.
Brainrot: Losing touch with reality from overconsumption of online content.
Bussin': Extremely good, especially for food.
Cap: Lie or exaggeration.
Caught in 4K: Undeniably caught doing something wrong.
Clapback: Swift, witty response to criticism.
Cook: To perform well or excel at something.
Crash out: Make a reckless decision due to anger or upset.
Dank: Excellent, high-quality.
Dead/ded: So funny it "kills you."
Delulu: Having unrealistic or idealistic beliefs.
Drip: Trendy, high-class fashion.
Era: A period of interests or specific phase in life.
Face card: An attractive face.
Fire: Impressive, good, or cool.
Fit check: Showcasing your outfit.
Finna: Going to, about to.
Gagged: Shocked, amazed, speechless.
Ghost: End communication without explanation.
Glaze: To excessively praise or hype someone.
Glow-up: Major improvement in appearance or confidence.
GOAT: Greatest of all time.
Gucci: Good, cool, excellent.
Hit different: Being better in a distinctive way.
Ick: Sudden feeling of disgust for someone you were attracted to.
IJBOL: I just burst out laughing.
It's giving: It has the vibe or energy of something.
Iykyk: If you know, you know (inside joke).
L: Loss or failure (opposite of W).
Lit: Remarkable, interesting, or fun.
Main character: Someone who acts like they're the star of their life.
Mid: Average, mediocre, not special.
No cap: No lie, for real.
Oof: Expression of discomfort or sympathy.
Oomf: One of my followers/friends.
Out of pocket: Extremely wild, crazy or inappropriate behavior.
Periodt: Final statement with nothing more to be said.
Pick-me: Someone seeking validation by putting others down.
Pushing P: Acting with integrity while displaying success.
Ratio: When replies to a post outnumber likes/shares.
Red flag: Warning sign of toxic behavior.
Rizz: Charm or seduction skills.
Salty: Bitter, resentful, or irritated.
Sheesh: Expression of praise or being impressed.
Shook: Shocked, surprised, or bothered.
Simp: Being overly affectionate to win someone's affection.
Situationship: Ambiguous romantic relationship without defined status.
Sksksk: Expression of happiness or laughter.
Slaps: Something that's really good, especially music.
Slay: To do something exceptionally well.
Snatched: Flawlessly styled or having a narrow waist.
Stan: Supporting something to an extreme degree.
Sus: Suspicious or sketchy.
Tea: Gossip or secret information.
Touch grass: Go outside and reconnect with reality.
Understood the assignment: Did exactly what was expected, and well.
Valid: Socially acceptable or worthy of approval.
Vibe check: Assessing someone's personality or attitude.
W: Win or success (opposite of L).
Wig: Something so impressive it figuratively makes your wig fly off.
Yeet: To throw something forcefully or a general exclamation.
"""

# Configure Gemini API
try:
    genai.configure(api_key=GEMINI_API_KEY)
    
    # Restored original configuration
    generation_config = {
        "temperature": 0.8, # A bit creative but not too random
        "top_p": 0.9,
        "top_k": 40,
        "max_output_tokens": 1024, # Adjust as needed
    }
    
    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    ]
    
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash-latest", # Or "gemini-1.5-pro-latest" for potentially better quality
        generation_config=generation_config,
        safety_settings=safety_settings
    )
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    print(traceback.format_exc())

# Manually add CORS headers to all responses (keep this working fix)
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    print(f"Added CORS headers to response: {response.headers}")
    return response

@app.route('/')
def home():
    return redirect(url_for('convert_text'))

# Test endpoint
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"status": "API is working!"})

# Handle preflight requests
@app.route('/api/convert', methods=['OPTIONS'])
def handle_preflight():
    print("Received OPTIONS request for /api/convert")
    response = jsonify({'status': 'ok'})
    return response

# Helper function to adjust slang level
def adjust_prompt_for_slang_level(slang_level):
    """Generates appropriate prompt instructions based on slang level"""
    if slang_level <= 25:
        return """
        Apply a LIGHT amount of Gen Z slang. The conversion should be subtle with just a few slang terms.
        The response should be easily understandable to all audiences while having a slight Gen Z flavor.
        Use only the most common Gen Z phrases and keep most of the original structure intact.
        """
    elif slang_level <= 50:
        return """
        Apply a MODERATE amount of Gen Z slang. Create a balanced conversion that includes several Gen Z terms
        but still maintains readability for most audiences. Mix in popular Gen Z expressions where they fit naturally.
        """
    elif slang_level <= 75:
        return """
        Apply a STRONG amount of Gen Z slang. The conversion should heavily use Gen Z vocabulary, speech patterns,
        and text conventions. Feel free to modify sentence structures to match Gen Z communication styles.
        Include abbreviations and more specialized slang terms.
        """
    else:
        return """
        Apply a MAXIMUM amount of Gen Z slang. Go all out with the Gen Z transformation, using extensive slang,
        unconventional grammar, heavy abbreviations, and emoji usage where appropriate. The text should sound like
        it was written by someone deeply immersed in Gen Z internet culture. Don't hold back!
        """

# Main conversion endpoint
@app.route('/api/convert', methods=['POST'])
def convert_text():
    print("Received POST request for /api/convert")
    try:
        # Get data from request
        data = request.get_json()
        print(f"Request data: {data}")
        
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400

        original_text = data['text']
        if not original_text.strip():
            return jsonify({"converted_text": ""})
            
        # Get slang level (default to 50 if not provided)
        slang_level = int(data.get('slangLevel', 50))
        
        # Ensure slang level is within valid range
        slang_level = max(0, min(100, slang_level))
        
        print(f"Using slang level: {slang_level}")
            
        # For testing CORS without requiring a valid API key
        if GEMINI_API_KEY == "dummy_key_for_testing":
            print("Using dummy key - returning mock response")
            # Adjust mock response based on slang level
            if slang_level <= 25:
                return jsonify({"converted_text": f"This is the light GenZ version: {original_text}"})
            elif slang_level <= 50:
                return jsonify({"converted_text": f"Ngl, here's that text but make it GenZ: {original_text}"})
            elif slang_level <= 75:
                return jsonify({"converted_text": f"Fr fr, your text is giving: {original_text}"})
            else:
                return jsonify({"converted_text": f"OMG bestie! ur text is bussin no cap: {original_text}"})

        # Get level-specific instructions
        level_instructions = adjust_prompt_for_slang_level(slang_level)

        # Construct the prompt for Gemini with slang level adjustment
        prompt = f"""
You are a "Gen Z Slang Converter". Your job is to rewrite text into authentic, modern Gen Z slang.
Make it sound natural, not forced. The output should be fluent and reflect how a Gen Z individual would actually type or speak online.
Keep the core meaning of the original text.

{level_instructions}

Consider using some relevant slang from the following examples if they fit naturally:
{GEN_Z_SLANG_EXAMPLES}

Do not add any preambles like "Okay, here's the Gen Z version:". Just provide the converted text.

Original text:
"{original_text}"

Gen Z Converted text (slang level: {slang_level}%):
"""
        
        print("Sending request to Gemini API")
        response = model.generate_content(prompt)
        
        if not response.parts:
            print("No response from Gemini API")
            return jsonify({"error": "Content generation failed or was blocked. Try rephrasing your input."}), 500

        converted_text = response.text.strip()
        print(f"Generated response: {converted_text[:30]}...")
        return jsonify({"converted_text": converted_text})

    except Exception as e:
        print(f"Error converting text: {e}")
        print(traceback.format_exc())
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    print("=== GenZ Converter API ===")
    print("Starting Flask server on http://0.0.0.0:5001")
    print("CORS is enabled for all origins")
    print(f"Valid API key: {'Yes' if GEMINI_API_KEY != 'dummy_key_for_testing' else 'No (using dummy key)'}")
    print(f"Slang Level support: Enabled (0-100%)")
    app.run(debug=True, host='0.0.0.0', port=5001)