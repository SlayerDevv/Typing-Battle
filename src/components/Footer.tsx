export default function Footer() {
  const developers = [
    { name: "Birouk Mohammed Islam", github: "https://github.com/islamdev2022", linkedin: "https://www.linkedin.com/in/birouk-islam/" },
    { name: "Mati Yahya", github: "https://github.com/yahyamati", linkedin: "https://www.linkedin.com/in/yahya-mati-265381298/" },
    { name: "Hadef Houssam Eddine", github: "https://github.com/SlayerDevv", linkedin: "https://www.linkedin.com/in/houssam-eddine-hadef-248095260/" }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-white py-4 w-full z-10">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-center mb-3">Developed By</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {developers.map((dev, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-sm font-medium mb-1">{dev.name}</span>
                <div className="flex gap-2">
                  <a href={dev.github} target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-gray-300">
                    GitHub
                  </a>
                  <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-gray-300">
                    Linkedin
                  </a>
                </div>
              </div>
            ))}
          </div>
         
        </div>
        <div className="text-center text-sm text-gray-100">
          © {currentYear} Typing Speed Battle. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

