document.addEventListener("DOMContentLoaded", () => {
  // Fetch the image data
  fetch("http://localhost:4000/api/image")
    .then((response) => response.json())
    .then((data) => {
      console.log({ data });
      const image = data[0];
      console.log({ image });

      const imgElement = document.querySelector("img");

      imgElement.src = image.url;
      imgElement.alt = image.description || "Uploaded image";

      imgElement.width = 500;
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
    });
});

document.getElementById("generateBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("http://localhost:4000/generate-pdf", {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "generated_pdf.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    alert("PDF Downloaded Successfully!");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF");
  }
});
