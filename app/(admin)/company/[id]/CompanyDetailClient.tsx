"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/layout/Header";
import BackButton from "@/app/components/ui/reusables/BackButton";
import { ESGJourneyChart } from "@/app/(company)/components/ESGJourneyChart";
import { CompanyIdStat } from "@/app/components/company/CompanyIdStat";
import UsersTable from "@/app/components/company/UsersTable";
import {
  ESGCard,
  ESGOverallCard,
} from "@/app/components/common/dashboard/SubscriptionCard";
import CompanySubscriptionTab from "@/app/components/company/CompanySubscriptionTab";
import CompanyActivities from "@/app/components/company/CompanyActivities";
import CompanyInfo from "@/app/components/company/CompanyInfo";
import Spinner from "@/app/components/ui/reusables/Spinner";
import { Company, companyService } from "@/services/company.service";

const PERSONA_TABS = [
  { label: "Overview", value: "overview" },
  { label: "Assessment & Reports", value: "assessment & reports" },
  { label: "Subscription", value: "subscription" },
  { label: "Activities", value: "activities" },
  { label: "Company Info", value: "company-info" },
];

type Props = {
  id: number;
};

export default function CompanyDetailsClient({ id }: Props) {
  const [activePersona, setActivePersona] = useState("overview");
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchCompany = async () => {
  //     try {
  //       const data = await companyService.getDetails();
  //       setCompany(data);
  //     } catch (err) {
  //       console.error("Error fetching company:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchCompany();
  // }, [id]);
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (id) {
          const data = await companyService.viewProfile(id);
          setCompany(data);
        }
      } catch (error) {
        console.error("Error fetching company profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  if (loading) return <Spinner />;
  if (!company)
    return <div className="p-6 text-red-500">Company not found</div>;

  return (
    <section className="w-full p-4 md:p-6 space-y-6">
      <Header />
      <div className="flex gap-4">
        <BackButton />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-gray-600">{company.industry?.sector}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 p-4 shadow rounded-lg bg-white">
        {PERSONA_TABS.map((tab) => {
          const isActive = activePersona === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActivePersona(tab.value)}
              className={`w-full px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-150 cursor-pointer ${
                isActive
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-green-600 border-green-500 hover:bg-green-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activePersona === "overview" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 gap-4">
              <ESGOverallCard
                score={70}
                trend="up"
                trendValue="10%"
                iconSrc="/icons/environment.svg"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ESGCard
                  title="Environmental"
                  value={75}
                  trend="down"
                  trendValue="7%"
                  iconSrc="/icons/leaf.svg"
                  bgColor="bg-green-600"
                />
                <ESGCard
                  title="Social"
                  value={62}
                  trend="up"
                  trendValue="7%"
                  iconSrc="/icons/people-group.svg"
                  bgColor="bg-yellow-500"
                  textColor="text-black"
                />
                <ESGCard
                  title="Governance"
                  value={67}
                  trend="down"
                  trendValue="7%"
                  iconSrc="/icons/injustice.svg"
                  bgColor="bg-blue-600"
                />
              </div>
            </div>
            <ESGJourneyChart />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CompanyIdStat
              label="Staff Strength"
              value={company.staff || "N/A"}
              iconSrc="/icons/leaf.svg"
              iconBgColor="bg-green-200"
            />
            <CompanyIdStat
              label="Departments"
              value={25}
              iconSrc="/icons/company.svg"
              iconBgColor="bg-yellow-100"
            />
            <CompanyIdStat
              label="Reports Published"
              value={5}
              iconSrc="/icons/Assessment.svg"
              iconBgColor="bg-blue-100"
            />
            <CompanyIdStat
              label="Subscription"
              value={10}
              iconSrc="/icons/Investor.svg"
              iconBgColor="bg-gray-100"
            />
          </div>

          {/*  Still using mock UsersTable */}
          <UsersTable />
        </>
      )}

      {activePersona === "subscription" && (
        <CompanySubscriptionTab
          company={{
            company: company.name,
            industry: company.industry?.industry,
          }}
        />
      )}

      {activePersona === "assessment & reports" && (
        <div>Assessment Reports Coming Soon...</div>
      )}
      {activePersona === "activities" && <CompanyActivities />}
      {activePersona === "company-info" && <CompanyInfo company={company} />}
    </section>
  );
}
