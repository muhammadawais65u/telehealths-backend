import Service from "../models/Service.js";
import User from "../models/User.js";
import { sequelize } from "../config/db.js";

const serviceData = {
  title: "Remote Patient Monitoring",
  slug: "rpm",
  metaTitle: "Remote Patient Monitoring (RPM) | CCN Health",
  metaDescription: "FDA-cleared cellular devices for real-time vital sign monitoring. Generate $175–220 per patient per month with automated compliance tracking.",
  keywords: "RPM, Remote Patient Monitoring, Medicare, CPT codes, chronic care, telehealth",
  shortDescription: "Real-time vital sign monitoring with FDA-cleared cellular devices. Generate $175–220 per patient per month.",
  content: "Comprehensive remote patient monitoring solution for Medicare beneficiaries with chronic conditions.",
  status: "published",
  badge: "Medicare Programs",
  heroDescription: "Real-time vital sign monitoring with FDA-cleared cellular devices. Generate $175–220 per patient per month with automated compliance tracking and documentation.",
  tags: JSON.stringify(["FDA Cleared Devices", "Cellular Connectivity", "6 CPT Codes", "Zero Upfront Cost"]),
  overviewTitle: "Remote Patient Monitoring Overview",
  stats: JSON.stringify([
    { value: "$175–220", label: "Monthly Revenue Per Patient" },
    { value: "6", label: "Billable CPT Codes" },
    { value: "6", label: "Qualifying Conditions" },
  ]),
  overview: "RPM enables clinicians to monitor patient health data collected via FDA-cleared devices outside traditional clinical settings. Vital signs like blood pressure, weight, glucose, and SpO2 are captured automatically and transmitted via cellular connectivity.",
  overviewFeatures: JSON.stringify([
    "Automated 16-day compliance tracking",
    "Real-time vital sign alerts for clinical staff",
    "Integrated billing documentation in EHR",
    "Multi-condition monitoring per patient",
  ]),
  eligibility: JSON.stringify([
    { id: "01", name: "Hypertension", code: "I10", description: "Twice-daily BP readings with automated threshold alerts" },
    { id: "02", name: "Type 2 Diabetes", code: "E11.x", description: "Daily glucose monitoring with trend analysis" },
    { id: "03", name: "Heart Failure", code: "I50.x", description: "Daily weight + BP for fluid retention detection" },
    { id: "04", name: "COPD", code: "J44.x", description: "SpO2 and respiratory rate tracking" },
    { id: "05", name: "Chronic Kidney Disease", code: "N18.x", description: "Weight and BP for fluid overload prevention" },
    { id: "06", name: "Atrial Fibrillation", code: "I48.x", description: "Heart rate trending and rhythm monitoring" },
  ]),
  process: JSON.stringify([
    { id: "01", title: "Enroll & Educate", description: "Patient receives FDA-cleared cellular device with hands-on education covering usage, data transmission, and troubleshooting.", icon: "activity" },
    { id: "02", title: "Daily Data Transmission", description: "Readings auto-transmit via built-in cellular connection — no Wi-Fi, no apps, no patient interaction required. Minimum 16 days per month.", icon: "wifi" },
    { id: "03", title: "Clinical Review & Alerts", description: "Staff monitors incoming data through the platform dashboard. Configurable threshold alerts flag abnormal readings for immediate follow-up.", icon: "bell" },
    { id: "04", title: "Monthly Billing", description: "Compliant documentation is generated automatically. CPT codes are submitted with audit-ready time logs and clinical notes.", icon: "dollar-sign" },
  ]),
  platform: JSON.stringify([
    { id: "01", name: "Active Monitoring", count: 142, color: "blue" },
    { id: "02", name: "Alert Pending", count: 8, color: "amber" },
    { id: "03", name: "Review Required", count: 23, color: "red" },
    { id: "04", name: "On Hold", count: 12, color: "gray" },
  ]),
  keyStats: JSON.stringify([
    { value: "16+", label: "Days of Data Required" },
    { value: "11", label: "Monitoring Types" },
    { value: "6", label: "Billable CPT Codes" },
    { value: "$168", label: "Avg Monthly Per Patient" },
  ]),
  billingCodes: JSON.stringify([
    { code: "99453", price: "~$19.32", title: "Remote Monitoring Setup & Patient Education", description: "Initial setup and patient education on the use of remote monitoring equipment.", frequency: "One-time (per episode of care)" },
    { code: "99454", price: "~$55.72", title: "Remote Monitoring Device Supply & Daily Recordings", description: "Supply of the remote monitoring device with daily recording(s) or programmed alert(s) transmission. Requires minimum 16 days of data collection.", frequency: "Monthly (per 30-day period)" },
    { code: "99445", price: "~$55.72", title: "Remote Monitoring Device Supply — 2–15 Days", description: "Supply of remote monitoring device(s) covering 2–15 days of data collection. New for 2026.", frequency: "Monthly (mutually exclusive with 99454)" },
    { code: "99457", price: "~$50.94", title: "Remote Physiologic Monitoring Treatment Management — First 20 Minutes", description: "Clinical time spent reviewing, interpreting, and acting on remote monitoring data. Requires minimum 20 minutes of interactive communication.", frequency: "Monthly (per calendar month)" },
    { code: "99470", price: "~$25.47", title: "Remote Physiologic Monitoring Treatment Management — First 10 Minutes", description: "Clinical time when total management time is 10–19 minutes per calendar month. New for 2026.", frequency: "Monthly (mutually exclusive with 99457)" },
    { code: "99458", price: "~$42.22", title: "Remote Physiologic Monitoring Treatment Management — Each Additional 20 Minutes", description: "Each additional 20 minutes of clinical time spent on RPM treatment management beyond the initial 20 minutes.", frequency: "Monthly (requires base 99457)" },
  ]),
  whyCCN: JSON.stringify([
    { icon: "link2", title: "EHR Integration", description: "Seamless connections with PointClickCare, ALIS, athenahealth, and Epic. No double data entry." },
    { icon: "shield-check", title: "Automated Compliance", description: "16-day tracking, time logging, and audit-ready documentation generated automatically." },
    { icon: "rocket", title: "Rapid Onboarding", description: "Go live in days. Pre-configured devices, 45-minute training, and dedicated support from day one." },
    { icon: "dollar-sign", title: "Zero Risk", description: "No upfront costs, no long-term contracts. We succeed when you succeed." },
    { icon: "monitor", title: "Multi-Condition Monitoring", description: "One patient, multiple vitals, stacked billing. Monitor BP, weight, glucose, and SpO2 simultaneously." },
    { icon: "users", title: "Dedicated Support", description: "Assigned account manager plus clinical support team available throughout your program." },
  ]),
  complianceNotes: JSON.stringify([
    "RPM services can be furnished by clinical staff under general supervision of the billing practitioner",
    "The ordering practitioner does not need to personally perform the monitoring — qualified clinical staff can fulfill the time requirements",
    "RPM can be billed concurrently with CCM, but time cannot be double-counted across programs",
    "Medicare requires that RPM data be electronically collected and transmitted — manual patient self-reporting does not qualify",
    "RPM services are not limited to established patients; new patients may receive RPM if clinical criteria are met",
    "Time spent on RPM management (99457/99458/99470) must involve live, interactive communication — not solely automated alerts or passive data review",
    "New for 2026: 99445 (2–15 days) and 99470 (10-min management) close billing gaps for patients with shorter monitoring windows or lower clinical engagement thresholds",
    "Device supply codes 99445 and 99454 are mutually exclusive — bill only one per 30-day period based on actual days of data transmission",
    "Treatment management codes 99470 and 99457 are mutually exclusive — bill 99470 for 10–19 minutes or 99457 for 20+ minutes per calendar month",
  ]),
  commonMistakes: JSON.stringify([
    "Billing 99454 without achieving 16 days of transmitted data in the 30-day period",
    "Billing 99445 and 99454 in the same 30-day period — these device supply codes are mutually exclusive",
    "Billing 99470 alongside 99457 or 99458 in the same calendar month — treatment management codes are mutually exclusive",
    "Not documenting interactive communication with the patient for 99457 or 99470 — passive data review alone does not qualify",
    "Billing 99458 without a corresponding base 99457 claim in the same calendar month",
    "Using non-FDA-cleared consumer wellness devices instead of FDA-cleared medical devices",
  ]),
  faqs: JSON.stringify([
    { question: "Can RPM be billed for the same patient receiving CCM services?", answer: "Yes, RPM and CCM can be billed concurrently for the same patient in the same month." },
    { question: "What counts as a 'day of data' for the 16-day requirement under 99454?", answer: "A qualifying day of data requires at least one physiologic reading to be collected and electronically transmitted." },
    { question: "Does the 20-minute requirement for 99457 need to be a single continuous session?", answer: "No, the 20 minutes can be accumulated across multiple interactions throughout the calendar month." },
  ]),
};

export const seedServices = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Find or create an admin user
    let user = await User.findOne({ where: { email: "admin@ccnhealth.com" } });
    if (!user) {
      user = await User.create({
        name: "Admin User",
        email: "admin@ccnhealth.com",
        password: "admin123", // This should be hashed in production
        role: "admin",
      });
      console.log("Admin user created.");
    }

    // Check if service already exists
    const existingService = await Service.findOne({ where: { slug: "rpm" } });
    if (existingService) {
      console.log("RPM service already exists. Skipping seed.");
      return;
    }

    // Create service
    const service = await Service.create({
      ...serviceData,
      userId: user.id,
    });

    console.log("RPM service seeded successfully:", service.title);
  } catch (error) {
    console.error("Error seeding services:", error);
  } finally {
    await sequelize.close();
  }
};

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedServices();
}
