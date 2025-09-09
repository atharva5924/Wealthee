import React,{ useState, useEffect } from "react";

const PasswordStrength = ({ password, analysis, showSuggestions = true }) => {
  const [localAnalysis, setLocalAnalysis] = useState(null);

  useEffect(() => {
    if (password && password.length > 0) {
      analyzePassword(password);
    } else {
      setLocalAnalysis(null);
    }
  }, [password]);

  const analyzePassword = (pwd) => {
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const length = pwd.length;

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

    setLocalAnalysis({
      strength,
      score: Math.max(0, Math.min(100, score)),
      suggestions,
      issues,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSpecialChars,
      length,
    });
  };

  const currentAnalysis = analysis || localAnalysis;

  if (!password || !currentAnalysis) {
    return null;
  }

  const getStrengthColor = (strength) => {
    switch (strength) {
      case "strong":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "weak":
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  const getProgressColor = (strength) => {
    switch (strength) {
      case "strong":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "weak":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              Password Strength
            </span>
            <span
              className={`text-sm font-semibold capitalize ${getStrengthColor(
                currentAnalysis.strength
              )}`}
            >
              {currentAnalysis.strength} ({currentAnalysis.score}%)
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                currentAnalysis.strength
              )}`}
              style={{ width: `${currentAnalysis.score}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div
          className={`flex items-center space-x-2 ${
            currentAnalysis.length >= 8 ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>{currentAnalysis.length >= 8 ? "✓" : "✗"}</span>
          <span>8+ characters</span>
        </div>

        <div
          className={`flex items-center space-x-2 ${
            currentAnalysis.hasUppercase ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>{currentAnalysis.hasUppercase ? "✓" : "✗"}</span>
          <span>Uppercase letter</span>
        </div>

        <div
          className={`flex items-center space-x-2 ${
            currentAnalysis.hasLowercase ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>{currentAnalysis.hasLowercase ? "✓" : "✗"}</span>
          <span>Lowercase letter</span>
        </div>

        <div
          className={`flex items-center space-x-2 ${
            currentAnalysis.hasNumbers ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>{currentAnalysis.hasNumbers ? "✓" : "✗"}</span>
          <span>Number</span>
        </div>

        <div
          className={`flex items-center space-x-2 ${
            currentAnalysis.hasSpecialChars ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>{currentAnalysis.hasSpecialChars ? "✓" : "✗"}</span>
          <span>Special character</span>
        </div>
      </div>

      {currentAnalysis.issues && currentAnalysis.issues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-2">
              <h4 className="text-sm font-medium text-red-800">Issues Found</h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {currentAnalysis.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {showSuggestions &&
        currentAnalysis.suggestions &&
        currentAnalysis.suggestions.length > 0 &&
        currentAnalysis.strength !== "strong" && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400">💡</span>
              </div>
              <div className="ml-2">
                <h4 className="text-sm font-medium text-blue-800">
                  Suggestions
                </h4>
                <ul className="mt-1 text-sm text-blue-700 list-disc list-inside">
                  {currentAnalysis.suggestions
                    .slice(0, 3)
                    .map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default PasswordStrength;
