import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useApiRequest } from "../Util/useApiRequest";
import { DefaultBillTemplate } from "./Bill-Templates/bike-zone";

export function PrintBill() {
  const router = useRouter();
  const [companyInfo, setCompanyInfo] = useState({});
  const [billData, setBillData] = useState(null);
  const [error, setError] = useState("");
  const { apiRequest } = useApiRequest();

  useEffect(() => {
    if (router?.query?.id) {
      const fetchData = async () => {
        try {
          // Fetch company info
          const companyRes = await apiRequest(`/api/company`);
          const { name, address, phoneNumber, upiId } = companyRes.data;
          setCompanyInfo({
            name,
            address: address[0],
            city: address[1],
            number: phoneNumber,
            upiId,
          });

          // Fetch bill data
          const billRes = await apiRequest(
            `/api/bills/${router.query.id}`,
            "GET",
          );
          if (billRes.success) {
            setBillData(billRes.data);
          } else {
            setError("Failed to load bill data");
          }
        } catch (err) {
          setError(err.message || "Failed to load bill data");
        }
      };

      fetchData();
    }
  }, [router?.query?.id]);

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (!billData) {
    return <div className="p-4">Loading bill data...</div>;
  }

  return <DefaultBillTemplate companyInfo={companyInfo} billData={billData} />;
}
