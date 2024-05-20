import React from "react";
const SimpleTable = ({ data }) => {
  // Check if the table has a table_body
  const tableBody = data.children.find((child) => child.type === "table_body");

  return (
    <table className="border-collapse border border-slate-400 w-full mb-4 ">
      <tbody>
        {/* If table_body exists, use its children, otherwise use table's children directly */}
        {(tableBody ? tableBody.children : data.children).map(
          (rowData, rowIndex) => (
            <tr
              key={rowIndex}
              className="border  border-black font-medium text-center"
            >
              {rowData.children.map((cellData, cellIndex) => (
                <td key={cellIndex} className="border  border-black p-2 bold">
                  {/* Handle the paragraph within the cell */}
                  {cellData.children[0].children.map(
                    (paragraphChild, pIndex) => (
                      <p key={pIndex} className="text-black">
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
