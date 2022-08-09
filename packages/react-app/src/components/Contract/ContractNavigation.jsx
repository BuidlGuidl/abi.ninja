import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import ContractNavigationMarker from "./ContractNavigationMarker";

export default function ContractNavigation({ contractMethods }) {
  const history = useHistory();

  useEffect(() => {
    if (!history?.location?.search) return;

    const selectedMethod = history.location.search.substring(1);
    document.getElementById(selectedMethod).scrollIntoView({ behavior: "smooth" });
  }, [history.location]);

  return (
    <div className="contract-navigation-content">
      <ul>
        {contractMethods.map(method => {
          return (
            <li key={method}>
              <span
                data-target={`method-${method}`}
                onClick={() => history.push({ hash: "contract", search: `method-${method}` })}
              >
                {method}
              </span>
            </li>
          );
        })}
      </ul>
      <ContractNavigationMarker />
    </div>
  );
}
