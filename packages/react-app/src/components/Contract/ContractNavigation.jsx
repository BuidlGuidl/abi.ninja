import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

export default function ContractNavigation({ contractMethods }) {
  const history = useHistory();

  useEffect(() => {
    if (!history?.location?.search) return;

    const selectedMethod = history.location.search.substring(1);
    document.getElementById(selectedMethod).scrollIntoView({ behavior: "smooth" });
  }, [history.location]);

  return (
    <ul>
      {contractMethods.map(method => {
        return (
          <li>
            <span onClick={() => history.push({ hash: "contract", search: `method-${method}` })}>{method}</span>
          </li>
        );
      })}
    </ul>
  );
}
