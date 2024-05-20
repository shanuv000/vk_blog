import React from "react";

const SimpleTable = ({ data }) => {
  // Check if the table has a table_body
  const tableBody = data.children.find((child) => child.type === "table_body");

  // Extract rows data
  const rows = tableBody ? tableBody.children : data.children;

  return (
    <table className="border-collapse border-none w-full mb-4">
      <tbody>
        {rows.map((rowData, rowIndex) =>
          rowIndex === 0 ? (
            <tr
              key={rowIndex}
              className="border border-black font-medium text-center"
            >
              {rowData.children.map((cellData, cellIndex) => (
                <td key={cellIndex} className="border border-black p-2">
                  {cellData.children[0].children.map(
                    (paragraphChild, pIndex) => (
                      <p key={pIndex} className="text-red-400 font-semibold">
                        {paragraphChild.text}
                      </p>
                    )
                  )}
                </td>
              ))}
            </tr>
          ) : (
            <tr key={rowIndex} className="border border-black font-medium ">
              {rowData.children.map((cellData, cellIndex) => (
                <td key={cellIndex} className="border border-black p-2">
                  {cellData.children[0].children.map(
                    (paragraphChild, pIndex) => (
                      <p key={pIndex} className="text-gray-600 font-medium">
                        {paragraphChild.text}
                      </p>
                    )
                  )}
                </td>
              ))}
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};

export default SimpleTable;
