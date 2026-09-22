using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace PenguinSnowball
{
    public sealed class TitleMenuController : MonoBehaviour
    {
        [SerializeField] private Button easyButton;
        [SerializeField] private Button normalButton;
        [SerializeField] private Button hardButton;
        [SerializeField] private Button timePreviousButton;
        [SerializeField] private Button timeNextButton;
        [SerializeField] private Text timeValueText;

        private readonly int[] durations = { 120, 180, 300 };
        private int durationIndex = 1;

        private void Awake()
        {
            durationIndex = Mathf.Max(0, System.Array.IndexOf(durations, GameSessionSettings.DurationSeconds));
            if (durationIndex < 0) durationIndex = 1;

            easyButton?.onClick.AddListener(() => StartBattle(BattleDifficulty.Easy));
            normalButton?.onClick.AddListener(() => StartBattle(BattleDifficulty.Normal));
            hardButton?.onClick.AddListener(() => StartBattle(BattleDifficulty.Hard));
            timePreviousButton?.onClick.AddListener(() => ChangeTime(-1));
            timeNextButton?.onClick.AddListener(() => ChangeTime(1));

            RefreshTime();
        }

        private void ChangeTime(int delta)
        {
            durationIndex = Mathf.Clamp(durationIndex + delta, 0, durations.Length - 1);
            GameSessionSettings.DurationSeconds = durations[durationIndex];
            RefreshTime();
        }

        private void RefreshTime()
        {
            if (timeValueText != null)
                timeValueText.text = $"{durations[durationIndex] / 60} 분";
        }

        private static void StartBattle(BattleDifficulty difficulty)
        {
            GameSessionSettings.Difficulty = difficulty;
            SceneManager.LoadScene("Battle");
        }
    }
}
