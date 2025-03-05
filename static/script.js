const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const outputCanvas = document.getElementById("outputCanvas");
const context = canvas.getContext("2d");
const outputContext = outputCanvas.getContext("2d");
const customCursor = document.getElementById("customCursor");

const button_istoric = document.getElementById("istoric_scolar");
const button_note = document.getElementById("note");
const button_index = document.getElementById("index");
const button_year = document.getElementById("yearFormButton");
const dropdown = document.getElementById("yearSelect");

let gest = null;

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })
  .catch((err) => {
    console.error("Error accessing webcam: ", err);
  });

video.addEventListener("play", () => {
  function resizeCanvas() {
    outputCanvas.width = window.innerWidth;
    outputCanvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  setInterval(() => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameData = canvas.toDataURL("image/jpeg");

    $.ajax({
      url: "/process_frame",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ frameData: frameData }),
      success: (response) => {
        gest = response.gesture;
        const image = new Image();
        image.onload = () => {
          outputContext.save();
          outputContext.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
          outputContext.scale(-1, 1);
          outputContext.drawImage(
            image,
            -outputCanvas.width,
            0,
            outputCanvas.width,
            outputCanvas.height
          );
          outputContext.restore();
        };
        image.src = response.frameData;

        if (response.indexFingerTipx && response.indexFingerTipy) {
          const adjustedX =
            ((canvas.width - response.indexFingerTipx) * outputCanvas.width) / canvas.width;
          const adjustedY = (response.indexFingerTipy * outputCanvas.height) / canvas.height;

          customCursor.style.left = `${adjustedX}px`;
          customCursor.style.top = `${adjustedY}px`;

          // Find the element under cursor
          const element = document.elementFromPoint(adjustedX, adjustedY);
          if (element) {
            handleHoverClick(element, gest);
          }
        }
      },
    });
  }, 100);
});

/**
 * Handles hover and click gestures on elements
 */
function handleHoverClick(element, gesture) {
  if (gesture === "Click") {
      element.click();
      triggerButtonClickEvent(element);
  } else if (gesture === "Hover") {
      applyHoverEffect(element);
  }
}

/**
* Applies the hover effect manually for the custom cursor.
*/
function applyHoverEffect(element) {
  if (!element) return;

  // Remove hover effect from previously hovered elements
  document.querySelectorAll(".hovered").forEach((el) => {
      el.classList.remove("hovered");
      el.style.backgroundColor = "";
      el.style.color = "";
  });

  // Apply hover effect to the current element
  element.classList.add("hovered");

  // Check if it's a button or interactive element
  if (element.classList.contains("button")) {
      element.style.backgroundColor = "#979797"; // Hover color
      element.style.transform = "scale(1.05)";
  }
}

/**
* Removes hover effects when the cursor moves away.
*/
function resetHoverEffects() {
  document.querySelectorAll(".hovered").forEach((el) => {
      el.classList.remove("hovered");
      el.style.backgroundColor = "";
      el.style.color = "";
      el.style.transform = "scale(1)";
  });
}




/**
 * Highlights an element when hovering
 */
function highlightElement(element) {
  if (!element) return;
  
  // Reset previously highlighted elements
  document.querySelectorAll(".hovered").forEach((el) => {
    el.classList.remove("hovered");
    el.style.backgroundColor = "";
    el.style.color = "";
  });

  element.classList.add("hovered");
  element.style.backgroundColor = "#5f2c82";
  element.style.color = "#ffffff";
}

/**
 * Resets styles when cursor moves away
 */
function resetHoverEffects() {
  document.querySelectorAll(".hovered").forEach((el) => {
    el.classList.remove("hovered");
    el.style.backgroundColor = "";
    el.style.color = "";
  });
}
