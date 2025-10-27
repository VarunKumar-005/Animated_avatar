
import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Array to store console messages
        console_messages = []

        # Listen for console events and store them
        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))

        try:
            # Navigate to the running application
            await page.goto("http://localhost:3005", wait_until="networkidle")

            # Wait for a specific element that should be visible on the page to ensure it's loaded
            await expect(page.get_by_role("heading", name="Discover the Ultimate Learning Avatars")).to_be_visible(timeout=10000)

            # Take a screenshot
            await page.screenshot(path="jules-scratch/verification/verification.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            # Still take a screenshot on error to see the page state
            await page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        finally:
            # Print all captured console messages
            print("\\n--- Console Messages ---")
            if console_messages:
                for msg in console_messages:
                    print(msg)
            else:
                print("No console messages captured.")
            print("--- End Console Messages ---\\n")

            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
