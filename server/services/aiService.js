import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HF_CHAT_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_API_TOKEN = process.env.HUGGINGFACE_API_KEY;

const MODELS = {
  TEXT_GENERATION: "openai/gpt-oss-20b:together", 
  ANALYSIS: "facebook/bart-large-mnli", 
};

export class AIService {
  isAIAvailable() {
    return HF_API_TOKEN !== null && HF_API_TOKEN !== undefined;
  }
  async callHuggingFaceChatAPI(modelName, prompt, retries = 2) {
    try {
      const response = await axios.post(
        HF_CHAT_API_URL,
        {
          model: modelName,
          messages: [{ role: "user", content: prompt }],
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      if (error.response?.status === 503 && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return this.callHuggingFaceChatAPI(modelName, prompt, retries - 1);
      }
      throw error;
    }
  }

  async analyzePasswordStrength(password) {
    if (!this.isAIAvailable()) {
      return this.fallbackPasswordAnalysis(password);
    }

    const prompt = `Analyze this password strength and respond with only valid JSON:
Password: "${password}"

Required JSON format:
{
  "strength": "weak|medium|strong",
  "score": 0-100,
  "suggestions": ["suggestion1", "suggestion2"],
  "issues": ["issue1", "issue2"],
  "hasUppercase": true/false,
  "hasLowercase": true/false,
  "hasNumbers": true/false,
  "hasSpecialChars": true/false,
  "length": ${password.length}
}

JSON response:`;

    try {
      const generatedText = await this.callHuggingFaceChatAPI(
        MODELS.TEXT_GENERATION,
        prompt
      );

      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const rawJson = jsonMatch[0];
        const cleanedJson = rawJson.substring(0, rawJson.indexOf("}]}") + 3);
        try {
          return JSON.parse(cleanedJson);
        } catch (error) {
          console.error("Failed parsing cleaned JSON:", error);
          console.error("Raw JSON:", cleanedJson);
          throw error;
        }
      } else {
        throw new Error("Invalid JSON response");
      }
    } catch (error) {
      console.error("AI password analysis error:", error);
      return this.fallbackPasswordAnalysis(password);
    }
  }

  async getProductRecommendations(
    userRiskAppetite,
    products,
    userAge = 30,
    investmentGoals = "Growth"
  ) {
    if (!this.isAIAvailable()) {
      return this.fallbackProductRecommendations(userRiskAppetite, products);
    }

    const prompt = `As a financial advisor, recommend investment products for:
- Risk Appetite: ${userRiskAppetite}
- Age: ${userAge}
- Goals: ${investmentGoals}

Available Products: ${JSON.stringify(products.slice(0, 5), null, 2)}

Respond with only valid JSON:
{
  "recommendations": [
    {
      "productId": "id",
      "name": "name",
      "recommendationScore": 85,
      "reason": "explanation",
      "riskAlignment": "alignment",
      "suggestedAllocation": "25%"
    }
  ],
  "portfolioStrategy": "strategy explanation",
  "riskWarnings": ["warning1", "warning2"]
}

JSON response:`;

    try {
      const generatedText = await this.callHuggingFaceChatAPI(
        MODELS.TEXT_GENERATION,
        prompt
      );

      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response");
      }
    } catch (error) {
      console.error("AI product recommendation error:", error);
      return this.fallbackProductRecommendations(userRiskAppetite, products);
    }
  }
  async generatePortfolioInsights(investments, userProfile) {
    if (!this.isAIAvailable()) {
      return this.fallbackPortfolioInsights(investments);
    }

    const prompt = `Analyze this investment portfolio:

User: ${JSON.stringify(userProfile, null, 2)}

Investments: ${JSON.stringify(investments.slice(0, 10), null, 2)}

Respond with only valid JSON:

{
  "riskDistribution": {
    "low": 40,
    "moderate": 40,
    "high": 20
  },
  "diversificationScore": 75,
  "insights": [
    {
      "type": "strength",
      "message": "insight description",
      "priority": "medium"
    }
  ],
  "recommendations": [
    {
      "action": "hold",
      "asset": "asset name",
      "reason": "explanation",
      "urgency": "low"
    }
  ],
  "expectedReturns": {
    "annual": 8.5,
    "total": 25000
  },
  "riskAssessment": "overall assessment"
}

JSON response:
`;

    try {
      const generatedText = await this.callHuggingFaceChatAPI(
        MODELS.TEXT_GENERATION,
        prompt
      );

      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }

      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Failed to parse JSON from AI response", parseError);
        console.error("Raw JSON:", jsonMatch[0]);
        throw parseError;
      }
    } catch (error) {
      console.error("AI portfolio analysis error:", error);
      return this.fallbackPortfolioInsights(investments);
    }
  }

  async generateProductDescription(productData) {
    if (!this.isAIAvailable()) {
      return `${productData.name} is a ${productData.investment_type} investment offering ${productData.annual_yield}% annual returns with ${productData.risk_level} risk level over ${productData.tenure_months} months.`;
    }

    const prompt = `Create a compelling investment product description for:

Name: ${productData.name}
Type: ${productData.investment_type}
Annual Yield: ${productData.annual_yield}%
Risk Level: ${productData.risk_level}
Tenure: ${productData.tenure_months} months
Min Investment: $${productData.min_investment}

Write 150-200 words that explains benefits, highlights key features, mentions appropriate risk factors, and appeals to target investors.

Product Description:`;

    try {
      const generatedText = await this.callHuggingFaceChatAPI(
        MODELS.TEXT_GENERATION,
        prompt
      );

      return (
        generatedText.trim() ||
        `${productData.name} is a ${productData.investment_type} investment offering ${productData.annual_yield}% annual returns with ${productData.risk_level} risk level over ${productData.tenure_months} months.`
      );
    } catch (error) {
      console.error("AI description generation error:", error);
      return `${productData.name} is a ${productData.investment_type} investment offering ${productData.annual_yield}% annual returns with ${productData.risk_level} risk level over ${productData.tenure_months} months.`;
    }
  }

  async summarizeUserErrors(transactionLogs) {
    const errorLogs = transactionLogs.filter((log) => log.status_code >= 400);

    if (errorLogs.length === 0) {
      return {
        summary: "No errors found in recent transactions.",
        patterns: [],
        recommendations: ["Continue following current practices"],
        errorCount: 0,
      };
    }

    if (!this.isAIAvailable()) {
      return {
        summary: `Found ${errorLogs.length} errors in recent transactions.`,
        patterns: ["Multiple error types detected"],
        recommendations: ["Please review system logs manually"],
        errorCount: errorLogs.length,
        mostCommonError: errorLogs[0].error_message || "Unknown error",
      };
    }

    const prompt = `Analyze these error logs and respond with only valid JSON:

Error Logs: ${JSON.stringify(errorLogs.slice(0, 20), null, 2)}

Required JSON format:
{
  "summary": "brief overview",
  "patterns": ["pattern1", "pattern2"],
  "recommendations": ["rec1", "rec2"],
  "criticalIssues": ["issue1", "issue2"],
  "errorCount": ${errorLogs.length},
  "mostCommonError": "error description"
}

JSON response:`;

    try {
      const generatedText = await this.callHuggingFaceChatAPI(
        MODELS.TEXT_GENERATION,
        prompt
      );

      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response");
      }
    } catch (error) {
      console.error("AI error summarization error:", error);
      return {
        summary: `Analysis unavailable. Found ${errorLogs.length} errors.`,
        patterns: ["Unable to analyze patterns"],
        recommendations: ["Please check system logs manually"],
        errorCount: errorLogs.length,
      };
    }
  }


  fallbackPasswordAnalysis(password) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    let score = 0;
    let issues = [];
    let suggestions = [];

    if (length >= 12) score += 30;
    else if (length >= 8) score += 20;
    else issues.push("Password too short (minimum 8 characters)");

    if (hasUppercase) score += 20;
    else suggestions.push("Add uppercase letters (A-Z)");

    if (hasLowercase) score += 20;
    else suggestions.push("Add lowercase letters (a-z)");

    if (hasNumbers) score += 15;
    else suggestions.push("Add numbers (0-9)");

    if (hasSpecialChars) score += 15;
    else suggestions.push("Add special characters (!@#$%^&*)");

    const strength = score >= 80 ? "strong" : score >= 60 ? "medium" : "weak";

    return {
      strength,
      score: Math.max(0, Math.min(100, score)),
      suggestions,
      issues,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSpecialChars,
      length,
    };
  }

  fallbackProductRecommendations(userRiskAppetite, products) {
    const riskMapping = {
      low: ["bond", "fd"],
      moderate: ["mf", "bond", "fd"],
      high: ["etf", "mf"],
    };

    const suitableTypes = riskMapping[userRiskAppetite] || ["bond"];
    const recommendations = products
      .filter((product) => suitableTypes.includes(product.investment_type))
      .slice(0, 3)
      .map((product, index) => ({
        productId: product.id,
        name: product.name,
        recommendationScore: 85 - index * 5,
        reason: `Matches your ${userRiskAppetite} risk appetite and investment profile`,
        riskAlignment: "Good alignment with your risk tolerance",
        suggestedAllocation: `${Math.floor(
          100 / Math.min(3, products.length)
        )}%`,
      }));

    return {
      recommendations,
      portfolioStrategy: `Conservative ${userRiskAppetite} risk strategy focused on ${
        userRiskAppetite === "low"
          ? "capital preservation"
          : userRiskAppetite === "high"
          ? "growth maximization"
          : "balanced growth"
      }`,
      riskWarnings: [
        "Past performance does not guarantee future results",
        "All investments carry inherent risks",
        "Consider diversification across asset classes",
      ],
    };
  }

  fallbackPortfolioInsights(investments) {
    const totalValue = investments.reduce(
      (sum, inv) => sum + parseFloat(inv.amount || 0),
      0
    );
    const averageYield =
      investments.reduce(
        (sum, inv) => sum + parseFloat(inv.annual_yield || 0),
        0
      ) / Math.max(investments.length, 1);

    const riskCount = { low: 0, moderate: 0, high: 0 };
    investments.forEach((inv) => {
      if (inv.risk_level) riskCount[inv.risk_level]++;
    });

    const total = Math.max(investments.length, 1);
    const riskDistribution = {
      low: Math.round((riskCount.low / total) * 100),
      moderate: Math.round((riskCount.moderate / total) * 100),
      high: Math.round((riskCount.high / total) * 100),
    };

    return {
      riskDistribution,
      diversificationScore: Math.min(90, investments.length * 15 + 30),
      insights: [
        {
          type: "strength",
          message: `Portfolio shows ${
            investments.length > 3 ? "good" : "basic"
          } diversification across ${investments.length} investments`,
          priority: "medium",
        },
        {
          type: investments.length < 3 ? "opportunity" : "strength",
          message:
            investments.length < 3
              ? "Consider adding more investments to improve diversification"
              : "Well-diversified investment approach",
          priority: investments.length < 3 ? "high" : "low",
        },
      ],
      recommendations: [
        {
          action: "hold",
          asset: "Current portfolio",
          reason: `Portfolio is ${
            investments.length > 3 ? "well-balanced" : "developing well"
          }`,
          urgency: "low",
        },
      ],
      expectedReturns: {
        annual: averageYield,
        total: totalValue * (1 + averageYield / 100),
      },
      riskAssessment: `Portfolio shows ${
        riskDistribution.high > 50
          ? "aggressive"
          : riskDistribution.low > 50
          ? "conservative"
          : "balanced"
      } risk profile with average expected returns of ${averageYield.toFixed(
        1
      )}%`,
    };
  }
}

export default new AIService();
