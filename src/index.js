const sharp = require("sharp");
const { createCanvas, loadImage } = require("canvas");

// Function to crop an image into a circle
async function cropToCircle(inputImagePath) {
  const image = sharp(inputImagePath);
  const metadata = await image.metadata();

  // Determine the smallest dimension for a perfect circle
  const width = metadata.width;
  const height = metadata.height;
  const diameter = Math.min(width, height);

  // Calculate the top and left offsets to center the circle
  const top = Math.floor((height - diameter) / 2);
  const left = Math.floor((width - diameter) / 2);

  // Crop the image into a circle and return the buffer
  return image
    .extract({ top: top, left: left, width: diameter, height: diameter })
    .toBuffer();
}

// Function to draw text and a circle onto a canvas
async function drawTextAndCircle(croppedBuffer, creatorName, companyName, outputImagePath) {
    const canvasSize = 350;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext("2d");

    // Set the background color to black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load the cropped image
    const image = await loadImage(croppedBuffer);

    // Draw the circular profile image
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    const radius = canvasSize / 2 - 5;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();

    // Add a green border around the circle
    ctx.strokeStyle = "#11FCCA";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.stroke();

    // Draw a black inner circle
    const innerRadius = 20;
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x, y, innerRadius, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.strokeStyle = "#11FCCA";
    ctx.stroke();
    
    // Set text style for drawing
    const fontSize = 13; // フォントサイズ
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const text = "QUBE";
    const textWidth = ctx.measureText(text).width;

    // Draw a rounded rectangle banner and its border
    const bannerHeight = fontSize * 1.7;
    const bannerWidth = textWidth + 30;
    const bannerX = 25;
    const bannerY = radius + 30;
    const bannerCenterX = bannerX + (bannerWidth / 2);
    const bannerCenterY = bannerY + (bannerHeight / 2);
    const borderRadius = 11;
    const strokeWidth = 2;

    // Draw the rounded rectangle
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    // Drawing each corner with arcs
    ctx.moveTo(bannerX + borderRadius, bannerY);
    ctx.arcTo(bannerX + bannerWidth, bannerY, bannerX + bannerWidth, bannerY + borderRadius, borderRadius); // top right
    ctx.arcTo(bannerX + bannerWidth, bannerY + bannerHeight, bannerX + bannerWidth - borderRadius, bannerY + bannerHeight, borderRadius); // bottom right
    ctx.arcTo(bannerX, bannerY + bannerHeight, bannerX, bannerY + bannerHeight - borderRadius, borderRadius); // bottom left
    ctx.arcTo(bannerX, bannerY, bannerX + borderRadius, bannerY, borderRadius); // top left
    ctx.closePath();
    // Fill and stroke the rectangle
    ctx.fill();
    ctx.stroke();

    // Add text to the banner
    ctx.fillStyle = "white";
    ctx.fillText(text, bannerCenterX, bannerCenterY);

    // Draw a black shadow area with blur effect
    const shadowRadius = radius * 0.6;
    const shadowY = y + radius / 2 + 10;
    const gradient = ctx.createRadialGradient(x, shadowY, 0, x, shadowY, shadowRadius);
    gradient.addColorStop(0, "rgba(0,0,0,0.7)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - shadowRadius, shadowY - shadowRadius, shadowRadius * 2, shadowRadius * 1.5);

    // Save context state before drawing text
    ctx.save();

    // Add creator and company names
    ctx.fillStyle = "#DF57EA";
    ctx.font = "bold 25px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(creatorName, x, radius + 80);
    ctx.fillText(companyName, x, radius + 120);
    ctx.fillStyle = "white";
    ctx.fillText("x", x, radius + 100);

    // Restore context state
    ctx.restore();

    // Output the canvas as a PNG image
    const buffer = canvas.toBuffer("image/png");
    await sharp(buffer).toFile(outputImagePath);
}

// Example usage
const inputImagePath = "./images/background.png"; // Path to the profile image

// Truncate the creator name if it's too long
const creatorNameMaxLength = 16;
const creatorName = "Creator Name";
console.log("creatorName count: ", creatorName.length);
let displayCreatorName;
if (creatorName.length > creatorNameMaxLength) {
  displayCreatorName = creatorName.substring(0, creatorNameMaxLength) + "...";
} else {
  displayCreatorName = creatorName;
}

// Truncate the company name if it's too long
const companyNameMaxLength = 12;
const companyName = "Company Name";
console.log("companyName count: ", companyName.length);
let displayCompanyName;
if (companyName.length > companyNameMaxLength) {
  displayCompanyName = companyName.substring(0, companyNameMaxLength) + "...";
} else {
  displayCompanyName = companyName;
}

// Path for the output image
const outputImagePath = "./output/final-image.png";

// Perform the image cropping and drawing
cropToCircle(inputImagePath, outputImagePath)
  .then(croppedBuffer => {
    return drawTextAndCircle(croppedBuffer, displayCreatorName, displayCompanyName, outputImagePath);
  })
  .then(() => console.log("Image processing complete"))
  .catch(error => console.error("Error during image processing:", error));