import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ApiRequest } from "../Util/apiRequest";
import { BikeZoneBill } from "./Bill-Templates/bike-zone";

const defaultCompanyInfo = {
  name: "Bike Zone",
  address: "Balaji Nagar",
  city: "Trichy Tanjore Highways",
  phone: "+91 98424 90088",
  email: "billing@.com",
  website: "www.company.com",
};

export function PrintBill() {
  const router = useRouter();
  const [companyInfo, setCompanyInfo] = useState(defaultCompanyInfo);
  const [billData, setBillData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (router?.query?.id) {
      ApiRequest(`/api/company`).then((res) => {
        console.log({ res: res.data });
        const { name, address, phoneNumber } = res.data;
        setCompanyInfo({ name, address: address[0], city: address[1], number: phoneNumber });
      });
      ApiRequest(`/api/bills/${router.query.id}`, "GET")
        .then((res) => {
          if (res.success) {
            setBillData(res.data);
          } else {
            setError("Failed to load bill data");
          }
        })
        .catch((err) => setError(err.message || "Failed to load bill data"));
    }
  }, [router?.query?.id]);

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (!billData) {
    return <div className="p-4">Loading bill data...</div>;
  }

  return <BikeZoneBill companyInfo={companyInfo} billData={billData} />;
}
