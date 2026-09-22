using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace PenguinSnowball
{
    public sealed class MatchResultOverlay : MonoBehaviour
    {
        [SerializeField] private GameObject panel;
        [SerializeField] private Text resultText;
        [SerializeField] private Button titleButton;

        private void Start()
        {
            if (panel != null)
                panel.SetActive(false);

            if (PenguinBattleController.Instance != null)
                PenguinBattleController.Instance.MatchEnded += OnMatchEnded;

            titleButton?.onClick.AddListener(() => SceneManager.LoadScene("Title"));
        }

        private void OnDestroy()
        {
            if (PenguinBattleController.Instance != null)
                PenguinBattleController.Instance.MatchEnded -= OnMatchEnded;
        }

        private void OnMatchEnded(bool playerWon)
        {
            if (resultText != null)
                resultText.text = playerWon ? "승리!" : "패배";

            if (panel != null)
                panel.SetActive(true);
        }
    }
}
