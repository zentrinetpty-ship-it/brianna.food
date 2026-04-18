"""Generate hero image for Brianna.app using Gemini Nano Banana."""
import asyncio
import os
import base64
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from emergentintegrations.llm.chat import LlmChat, UserMessage


async def generate():
    api_key = os.environ["EMERGENT_LLM_KEY"]
    chat = LlmChat(
        api_key=api_key,
        session_id="brianna-hero-gen",
        system_message="You are an expert food photographer and art director."
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])

    prompt = (
        "Ultra-high-end food photography hero banner, wide cinematic 16:9 composition, "
        "dramatic overhead and slight 3/4 angle flat-lay of AUTHENTIC NIGERIAN GROCERIES arranged on a warm "
        "off-white linen surface with scattered green banana leaves. "
        "Clearly show: whole dried STOCKFISH (okporoko), smoked catfish, bright green UGWU LEAVES (fluted pumpkin leaves), "
        "large edible snails in shells, dried crayfish piled in a small wooden bowl, a handful of EGUSI seeds, "
        "bright red scotch bonnet peppers (ata rodo), yellow ripe plantains, a tuber of yam, "
        "fresh OHA LEAVES, ground crayfish, palm oil in a small glass jar, suya spice mound, "
        "dried uziza pods, locust beans (iru), a small pile of fufu flour, ginger root, and a ceramic mortar with pestle. "
        "Bold dopamine-inducing color palette: saturated lime green, vibrant orange, deep forest green, warm amber accents. "
        "Sharp focus, crisp detail, studio lighting with soft shadows, rich textures, editorial magazine quality, "
        "Bon Appetit meets luxury cookbook aesthetic. Rich, vivid, and mouth-watering. "
        "Composition leaves ample negative space in the upper-left and center-top area for overlaying title text. "
        "NO TEXT in the image, NO logos, NO watermarks. Pure high-resolution product photography."
    )

    msg = UserMessage(text=prompt)
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"Text: {text[:120] if text else '(no text)'}")
    if not images:
        print("No images returned")
        return
    out = Path("/app/frontend/public/brianna-hero.png")
    img = images[0]
    data = base64.b64decode(img["data"])
    out.write_bytes(data)
    print(f"Saved: {out} ({len(data)} bytes, {img.get('mime_type')})")


if __name__ == "__main__":
    asyncio.run(generate())
