import React from "react";

export default function StatusBadge({ status }) {
    let cls = "badge ";
    if (status === "processing") cls += "badge-processing";
    else if (status === "done") cls += "badge-done";
    else cls += "badge-pending";

    return <span className={cls}>{status}</span>;
}
