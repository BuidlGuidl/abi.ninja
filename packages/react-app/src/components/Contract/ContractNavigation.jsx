import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import ContractNavigationMarker from "./ContractNavigationMarker";

export default function ContractNavigation({ contractMethods, contractIsDeployed }) {
  const history = useHistory();

  useEffect(() => {
    if (!history?.location?.state) return;

    const selectedMethod = history.location.state.method;
    document.getElementById(selectedMethod)?.scrollIntoView({ behavior: "smooth" });
  }, [history.location]);

  if (!contractIsDeployed) return null;

  return (
    <div className="contract-navigation-content">
      <ul>
        {contractMethods.map(method => {
          return (
            <li key={method}>
              <span
                data-target={`method-${method}`}
                onClick={() => history.push({ state: { method: `method-${method}` } })}
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
