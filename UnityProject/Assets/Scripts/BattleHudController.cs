using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace PenguinSnowball
{
    public sealed class BattleHudController : MonoBehaviour
    {
        [Header("Text")]
        [SerializeField] private Text timerText;
        [SerializeField] private Text playerHpText;
        [SerializeField] private Text enemyHpText;
        [SerializeField] private Text costText;

        [Header("Buttons")]
        [SerializeField] private Button cheerButton;
        [SerializeField] private Button homeButton;
        [SerializeField] private Button[] unitButtons = new Button[5];

        [Header("Meters")]
        [SerializeField] private Image[] costSegments = new Image[10];
        [SerializeField] private Image[] cheerSegments = new Image[12];

        [Header("Colors")]
        [SerializeField] private Color playerBlue = new Color32(8, 177, 207, 255);
        [SerializeField] private Color inactive = new Color32(247, 242, 222, 255);
        [SerializeField] private Color cheerYellow = new Color32(255, 204, 20, 255);

        private PenguinBattleController battle;

        private void Start()
        {
            battle = PenguinBattleController.Instance;
            if (battle == null)
                return;

            battle.CostChanged += OnCostChanged;
            battle.CheerChanged += OnCheerChanged;
            battle.BaseHpChanged += OnBaseHpChanged;
            battle.TimeChanged += OnTimeChanged;

            cheerButton?.onClick.AddListener(battle.TapCheer);
            homeButton?.onClick.AddListener(() => SceneManager.LoadScene("Title"));

            var types = new[]
            {
                PenguinType.Small,
                PenguinType.Gentoo,
                PenguinType.Chinstrap,
                PenguinType.Emperor,
                PenguinType.King
            };

            for (var i = 0; i < unitButtons.Length && i < types.Length; i++)
            {
                var captured = types[i];
                unitButtons[i]?.onClick.AddListener(() => battle.Select(captured));
            }

            OnCostChanged(battle.CurrentCost, battle.MaxCost);
            OnCheerChanged(battle.Cheer, battle.MaxCheer);
            OnBaseHpChanged(battle.PlayerBaseHp, battle.EnemyBaseHp);
            OnTimeChanged(battle.RemainingSeconds);
        }

        private void OnDestroy()
        {
            if (battle == null)
                return;

            battle.CostChanged -= OnCostChanged;
            battle.CheerChanged -= OnCheerChanged;
            battle.BaseHpChanged -= OnBaseHpChanged;
            battle.TimeChanged -= OnTimeChanged;
        }

        private void OnCostChanged(int current, int max)
        {
            if (costText != null)
                costText.text = current.ToString();

            for (var i = 0; i < costSegments.Length; i++)
                if (costSegments[i] != null)
                    costSegments[i].color = i < current ? playerBlue : inactive;
        }

        private void OnCheerChanged(float current, float max)
        {
            var ratio = max <= 0f ? 0f : Mathf.Clamp01(current / max);
            var filled = Mathf.RoundToInt(ratio * cheerSegments.Length);
            for (var i = 0; i < cheerSegments.Length; i++)
                if (cheerSegments[i] != null)
                    cheerSegments[i].color = i < filled ? cheerYellow : inactive;

            if (cheerButton != null)
            {
                cheerButton.transform.localScale = Vector3.one * 1.08f;
                CancelInvoke(nameof(ResetCheerScale));
                Invoke(nameof(ResetCheerScale), .08f);
            }
        }

        private void ResetCheerScale()
        {
            if (cheerButton != null)
                cheerButton.transform.localScale = Vector3.one;
        }

        private void OnBaseHpChanged(int player, int enemy)
        {
            if (playerHpText != null) playerHpText.text = player.ToString();
            if (enemyHpText != null) enemyHpText.text = enemy.ToString();
        }

        private void OnTimeChanged(int seconds)
        {
            if (timerText == null)
                return;

            seconds = Mathf.Max(0, seconds);
            timerText.text = $"{seconds / 60}:{seconds % 60:00}";
        }
    }
}
