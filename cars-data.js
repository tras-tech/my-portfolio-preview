/*
  HUMBLE DAVID VEHICLE INVENTORY
  Add, edit or remove vehicles only in this list. Use image paths relative to
  the website folder, e.g. "assets/cars/2020-toyota-camry-01.jpg".

  Copy this structure for each vehicle (do not leave a placeholder image live):
  {
    id: "2020-toyota-camry",
    images: ["assets/cars/2020-toyota-camry-01.jpg"], // Add more photos here if available.
    make: "Toyota", model: "Camry", year: 2020, price: 38500000,
    condition: "Foreign Used", mileage: "42,000 km", transmission: "Automatic",
    engine: "2.5L", fuel: "Petrol", location: "Lagos, Nigeria",
    description: "Short, accurate description of this specific vehicle.",
    whatsapp: "2348033969149", phone: "+2348033969149", availability: "AVAILABLE"
  }

  Set availability to "SOLD" after a sale. Sold vehicles are clearly marked
  and never appear in the homepage available-vehicle carousel.
*/
window.CAR_INVENTORY = [];
