import { test, expect } from "@playwright/test";

test.describe("Scanner page (native scanner)", () => {
  test("loads scanner UI and shows controls", async ({ page }) => {
    // Grant camera permission to avoid errors
    await page.context().grantPermissions(["camera"]);

    await page.goto("/scan/mobile");

    // Check mode toggle and controls are visible
    await expect(page.getByText(/Rapid Fire Mode/i)).toBeVisible();
    await expect(page.getByText(/Auto AI Clean/i)).toBeVisible();

    // Check for the native scanner component
    await expect(page.locator("video, .qrcode-stream-camera")).toBeVisible({
      timeout: 10000,
    });
  });

  test("rapid fire mode shows session queue UI", async ({ page }) => {
    await page.context().grantPermissions(["camera"]);
    await page.goto("/scan/mobile");

    // Verify rapid fire mode is enabled by default
    const checkbox = page.getByRole("checkbox", { name: /Rapid Fire Mode/i });
    await expect(checkbox).toBeChecked();

    // Check the empty state message
    await expect(
      page.getByText(/Point camera at barcodes to start scanning/i)
    ).toBeVisible();
  });
});
