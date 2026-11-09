
import React from "react";
import "./MacineryEquipmentTable.css";

const MacineryEquipmentTable = () => {
  const specifications = [
    {
      description: 'Tillage Width (mm / inch)',
      values: ['1500 / 59"', '1750 / 69"', '2000 / 79"', '2250 / 89"'],
    },
    {
      description: "Gearbox",
      values: [
        "Semi Automatic Multi (2 Speed)",
        "Semi Automatic Multi (2 Speed)",
        "Semi Automatic Multi (2 Speed)",
        "Semi Automatic Multi (2 Speed)",
      ],
    },
    {
      description: "Side Transmission",
      values: ["Gear Drive", "Gear Drive", "Gear Drive", "Gear Drive"],
    },
    {
      description: "Type of Blades",
      values: ["L & C Type", "L & C Type", "L & C Type", "L & C Type"],
    },
    {
      description: "No. of Flanges",
      values: ["6", "7", "8", "9"],
    },
    {
      description: "No. of Blades",
      values: ["36", "42", "48", "54"],
    },
    {
      description: "Gear Box Overload Protection",
      values: [
        "Shear Bolt / Slip Clutch",
        "Shear Bolt / Slip Clutch",
        "Shear Bolt / Slip Clutch",
        "Shear Bolt / Slip Clutch",
      ],
    },
    {
      description: "Weight (Kg/Lbs. Approx.)",
      values: ["465 / 1025", "495 / 1091", "525 / 1157", "555 / 1224"],
    },
    {
      description: "Tractor Power (HP)",
      values: ["40-45", "45-50", "50-60", "60-70"],
    },
  ];

  const models = [
    "FKRTGMG5-150",
    "FKRTGMG5-175",
    "FKRTGMG5-200",
    "FKRTGMG5-225",
  ];

  return (
    <section className="machinery-table-section">
      <div className="machinery-table-container">

        {/* Product Heading */}
        <h2 className="machinery-table-title">
          Fieldking Gold Rotary Tiller
        </h2>

        {/* Product Description */}
        <div className="machinery-table-description">

          <h4>
            Want to buy a Fieldking Gold Rotary Tiller?
          </h4>

          <p>
            Here at Tractor Junction, you can get Fieldking Gold Rotary
            Tiller at an affordable price. We provide all the details of
            the Fieldking Gold Rotary Tiller, including HP range,
            features, performance, price, and more.
          </p>

          <h4>
            Is Fieldking Gold Rotary Tiller perfect for farming?
          </h4>

          <p>
            Yes, it provides effective work on the field that makes
            Fieldking Gold Rotary Tiller perfect for farming. It comes
            under the Rotavator Category. And, it has 40-70 HP Implement
            Power that provides fuel efficient work. It is an implement
            that comes from the Fieldking brand house known for its
            superb quality niches.
          </p>

          <h4>
            What is the Fieldking Gold Rotary Tiller price?
          </h4>

          <p>
            Fieldking Gold Rotary Tiller price is available at Tractor
            Junction. You can just log on to us and register your number.
            After that, our customer support team will help you out with
            Fieldking Gold Rotary Tiller. For further, you have to stay
            tuned with us.
          </p>

          <p>
            Those considering financing options, explore the Fieldking
            Gold Rotary Tiller Implement Loan to make purchasing this
            machine more affordable.
          </p>

        </div>

        {/* Table Description */}
        <p className="machinery-table-intro">
          Here is the extracted information from your image, organized
          into a table format.
        </p>

        {/* Responsive Table */}
        <div className="machinery-table-wrapper">

          <table className="machinery-specification-table">

            <thead>
              <tr>
                <th>Description</th>

                {models.map((model) => (
                  <th key={model}>{model}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {specifications.map((item, index) => (
                <tr key={index}>

                  <td className="machinery-specification-label">
                    {item.description}
                  </td>

                  {item.values.map((value, valueIndex) => (
                    <td key={valueIndex}>
                      {value}
                    </td>
                  ))}

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>
    </section>
  );
};

export default MacineryEquipmentTable;
