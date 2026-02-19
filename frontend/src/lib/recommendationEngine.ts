// FinPulse AI Recommendation Engine
// Fully updated and DashboardPage-compatible version
// Fixes stabilityScore TypeScript error



/*
---------------------------------------
TYPE DEFINITIONS
---------------------------------------
*/

type Transaction = {
  amount: number;
  category: string;
};

type UserProfile = {
  age: number;
  income: number;
};

type Insights = {

  totalSpend: number;

  avgTransaction: number;

  salaryDetected: boolean;

  travelFrequency: number;

  investmentInterest: boolean;

  highSpender: boolean;

  saver: boolean;

  riskLevel: string;

  // REQUIRED by DashboardPage
  stabilityScore: number;

};

type Recommendation = {

  id: string;

  name: string;

  reason: string;

  confidence: number;

};



/*
---------------------------------------
CUSTOMER ANALYSIS ENGINE
---------------------------------------
*/

export function analyzeCustomer(
  transactions: Transaction[],
  userProfile: UserProfile
): Insights {

  const insights: Insights = {

    totalSpend: 0,

    avgTransaction: 0,

    salaryDetected: false,

    travelFrequency: 0,

    investmentInterest: false,

    highSpender: false,

    saver: false,

    riskLevel: "low",

    stabilityScore: 0

  };


  // Safety check
  if (!transactions || transactions.length === 0) {
    return insights;
  }


  /*
  PROCESS TRANSACTIONS
  */

  transactions.forEach((tx: Transaction) => {

    insights.totalSpend += tx.amount;

    if (tx.category === "salary") {
      insights.salaryDetected = true;
    }

    if (tx.category === "travel") {
      insights.travelFrequency++;
    }

    if (tx.category === "investment") {
      insights.investmentInterest = true;
    }

  });


  /*
  AVERAGE TRANSACTION
  */

  insights.avgTransaction =
    insights.totalSpend / transactions.length;



  /*
  SPENDING CLASSIFICATION
  */

  if (insights.totalSpend > 50000) {

    insights.highSpender = true;
    insights.riskLevel = "medium";

  }


  if (insights.totalSpend < 20000) {

    insights.saver = true;
    insights.riskLevel = "low";

  }



  /*
  STABILITY SCORE CALCULATION
  REQUIRED BY DashboardPage

  Normalized between 0 and 1
  Based on income + salary detection + spending consistency
  */

  let stability = 0;

  // Income factor (max 0.5)
  stability += Math.min(userProfile.income / 2000000, 0.5);

  // Salary detection factor (0.3)
  if (insights.salaryDetected) {
    stability += 0.3;
  }

  // Spending consistency factor (0.2)
  if (insights.avgTransaction > 0 && insights.avgTransaction < 50000) {
    stability += 0.2;
  }

  insights.stabilityScore = Math.min(stability, 1);



  return insights;

}




/*
---------------------------------------
RECOMMENDATION GENERATOR
---------------------------------------
*/

export function generateRecommendations(
  insights: Insights,
  userProfile: UserProfile
): Recommendation[] {

  const recommendations: Recommendation[] = [];


  /*
  CREDIT CARD RECOMMENDATION
  */

  if (insights.highSpender || insights.travelFrequency > 2) {

    recommendations.push({

      id: "credit_card_premium",

      name: "Premium Rewards Credit Card",

      reason:
        "Your spending and travel pattern qualifies you.",

      confidence: calculateConfidence(insights, "credit_card")

    });

  }



  /*
  INVESTMENT PLAN RECOMMENDATION
  */

  if (insights.salaryDetected && insights.saver) {

    recommendations.push({

      id: "investment_growth",

      name: "Growth Investment Plan",

      reason:
        "Your salary and saving behavior indicate investment readiness.",

      confidence: calculateConfidence(insights, "investment")

    });

  }



  /*
  PERSONAL LOAN RECOMMENDATION
  */

  if (insights.salaryDetected && insights.highSpender) {

    recommendations.push({

      id: "personal_loan",

      name: "Instant Personal Loan",

      reason:
        "Your income and spending profile qualifies for instant loan.",

      confidence: calculateConfidence(insights, "loan")

    });

  }



  /*
  SORT BY CONFIDENCE
  */

  return recommendations.sort(
    (a, b) => b.confidence - a.confidence
  );

}




/*
---------------------------------------
CONFIDENCE ENGINE
---------------------------------------
*/

function calculateConfidence(
  insights: Insights,
  productType: string
): number {

  let score = 50;


  if (productType === "credit_card") {

    if (insights.highSpender) score += 25;

    if (insights.travelFrequency > 2) score += 15;

    if (insights.stabilityScore > 0.7) score += 10;

  }


  if (productType === "investment") {

    if (insights.salaryDetected) score += 20;

    if (insights.saver) score += 20;

    if (insights.stabilityScore > 0.6) score += 10;

  }


  if (productType === "loan") {

    if (insights.salaryDetected) score += 20;

    if (insights.highSpender) score += 20;

    if (insights.stabilityScore > 0.65) score += 10;

  }


  return Math.min(score, 95);

}
