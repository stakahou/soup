import { useState } from "react";
import "./App.css";

interface PotAnalysis {
  potIndex: number;
  currentScore: number;
  isBusted: boolean;
  bustChance: number;
  goodChance: number;
  expectedValue: number;
}

function App() {
  const [pots, setPots] = useState<(number | null)[]>([
    9,
    14,
    15,
    null,
    null,
    null,
    null,
    null,
  ]);

  const [analysis, setAnalysis] = useState<{
    pots: PotAnalysis[];
    totalScore: number;
    totalExpected: number;
    bustRisk: number;
    recommendation: string;
    recommendationDetail: string;
  } | null>(null);

  const analyzePots = () => {
    const maxScore = 24;
    const idealMin = 22;
    const minDraw = 1;
    const maxDraw = 7;

    // Analyze each pot individually
    const results: PotAnalysis[] = pots.map((score, index) => {
      const isBusted = score !== null && score > maxScore;

      if (score === null || isBusted) {
        return {
          potIndex: index + 1,
          currentScore: score || 0,
          isBusted: true,
          bustChance: 0,
          goodChance: 0,
          expectedValue: 0,
        };
      }

      // Probability calculations
      let bustCount = 0;
      let goodCount = 0;
      let totalPossible = 0;
      let sum = 0;

      for (let draw = minDraw; draw <= maxDraw; draw++) {
        const newScore = score + draw;
        if (newScore > maxScore) {
          bustCount++;
        } else if (newScore >= idealMin) {
          goodCount++;
        }
        totalPossible++;
        sum += Math.min(newScore, maxScore);
      }

      return {
        potIndex: index + 1,
        currentScore: score,
        isBusted: false,
        bustChance: (bustCount / totalPossible) * 100,
        goodChance: (goodCount / totalPossible) * 100,
        expectedValue: sum / totalPossible,
      };
    });

    // Calculate global metrics
    const activePots = results.filter((p) => !p.isBusted && p.currentScore > 0);
    const totalScore = activePots.reduce((sum, p) => sum + p.currentScore, 0);
    const totalExpected = activePots.reduce(
      (sum, p) => sum + p.expectedValue,
      0
    );
    const avgBustRisk =
      activePots.reduce((sum, p) => sum + p.bustChance, 0) /
      Math.max(activePots.length, 1);
    const totalGoodChance =
      activePots.reduce((sum, p) => sum + p.goodChance, 0) /
      Math.max(activePots.length, 1);

    // Determine global recommendation
    let recommendation = "";
    let recommendationDetail = "";

    if (activePots.length === 0) {
      recommendation = "ALL BUSTED";
      recommendationDetail = "No active pots available";
    } else {
      const improvementPotential = totalExpected - totalScore;
      const riskRewardRatio = avgBustRisk / improvementPotential;

      if (totalScore >= 18 * activePots.length && avgBustRisk > 30) {
        recommendation = "COLLECT NOW";
        recommendationDetail = "High current score with increasing risk";
      } else if (
        riskRewardRatio < 0.4 &&
        improvementPotential > 3 * activePots.length
      ) {
        recommendation = "KEEP GOING";
        recommendationDetail =
          "Good improvement potential with acceptable risk";
      } else if (totalGoodChance > 40) {
        recommendation = "KEEP GOING";
        recommendationDetail = "High chance to reach excellent score (22-24)";
      } else {
        recommendation = "COLLECT";
        recommendationDetail = "Risk outweighs improvement potential";
      }
    }

    setAnalysis({
      pots: results,
      totalScore,
      totalExpected,
      bustRisk: avgBustRisk,
      recommendation,
      recommendationDetail,
    });
  };

  const handlePotChange = (index: number, value: string) => {
    const newPots = [...pots];
    newPots[index] = value === "" ? null : parseInt(value, 10);
    setPots(newPots);
  };

  return (
    <div className="soup-pot-analyzer">
      <h2>Soup Pot Strategy Analyzer</h2>
      <p className="subtitle">Global collection analysis for maximum points</p>

      <div className="pots-input">
        {pots.map((pot, index) => (
          <div key={index} className="pot-input">
            <label>Pot {index + 1}:</label>
            <input
              type="number"
              min="0"
              value={pot === null ? "" : pot}
              onChange={(e) => handlePotChange(index, e.target.value)}
              placeholder={pot === null ? "X" : "0"}
            />
          </div>
        ))}
      </div>

      <button onClick={analyzePots} className="analyze-btn">
        Calculate Strategy
      </button>

      {analysis && (
        <div className="results">
          <div
            className={`recommendation ${
              analysis.recommendation.includes("KEEP") ? "continue" : "collect"
            }`}
          >
            <h3>
              {analysis.recommendation === "KEEP GOING" && "🔄 KEEP GOING"}
              {analysis.recommendation === "COLLECT" && "✅ COLLECT NOW"}
              {analysis.recommendation === "COLLECT NOW" && "🚀 COLLECT NOW"}
              {analysis.recommendation === "ALL BUSTED" && "💥 ALL BUSTED"}
            </h3>
            <p>{analysis.recommendationDetail}</p>
          </div>

          <div className="global-metrics">
            <div className="metric">
              <span className="label">Current Points:</span>
              <span className="value">{analysis.totalScore}</span>
            </div>
            <div className="metric">
              <span className="label">Expected Value:</span>
              <span className="value">{analysis.totalExpected.toFixed(1)}</span>
            </div>
            <div className="metric">
              <span className="label">Average Risk:</span>
              <span className="value">{analysis.bustRisk.toFixed(1)}%</span>
            </div>
          </div>

          <div className="pots-status">
            <h4>Pot Status:</h4>
            <div className="pots-grid">
              {analysis.pots.map((pot) => (
                <div
                  key={pot.potIndex}
                  className={`pot-status ${pot.isBusted ? "busted" : ""}`}
                >
                  <span className="pot-number">#{pot.potIndex}</span>
                  <span className="pot-score">
                    {pot.currentScore}
                    {pot.isBusted && "+"}
                  </span>
                  {!pot.isBusted && (
                    <>
                      <span className="pot-risk">
                        {pot.bustChance.toFixed(0)}%
                      </span>
                      <span className="pot-expected">
                        {pot.expectedValue.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
