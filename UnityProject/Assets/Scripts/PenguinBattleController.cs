using System;
using System.Collections.Generic;
using UnityEngine;

namespace PenguinSnowball
{
    public enum PenguinType { Small, Gentoo, Chinstrap, Emperor, King }

    [Serializable]
    public struct PenguinStats
    {
        public PenguinType type;
        public int cost;
        public float hp;
        public float moveSpeed;
        public float attackRange;
        public float snowballMakeSeconds;
        public float throwWindupSeconds;
        public float damage;
        public float projectileSpeed;
    }

    public sealed class PenguinBattleController : MonoBehaviour
    {
        public static PenguinBattleController Instance { get; private set; }

        [Header("Battle")]
        [SerializeField] private Transform playerSpawnRoot;
        [SerializeField] private Transform enemySpawnRoot;
        [SerializeField] private PenguinUnit[] playerPrefabs;
        [SerializeField] private PenguinUnit[] enemyPrefabs;
        [SerializeField] private SnowballProjectile snowballPrefab;

        [Header("Resources")]
        [SerializeField] private int maxCost = 10;
        [SerializeField] private float costPerSecond = 0.85f;
        [SerializeField] private float cheerDecayPerSecond = 1.3f;
        [SerializeField] private float maxCheer = 8f;
        [SerializeField] private float maxCheerCraftMultiplier = 2.5f;

        [Header("Units")]
        [SerializeField] private PenguinStats[] unitStats =
        {
            new PenguinStats { type = PenguinType.Small, cost = 1, hp = 80, moveSpeed = 1.9f, attackRange = 2.1f, snowballMakeSeconds = 1.1f, throwWindupSeconds = .28f, damage = 15, projectileSpeed = 6.5f },
            new PenguinStats { type = PenguinType.Gentoo, cost = 3, hp = 150, moveSpeed = 2.8f, attackRange = 2f, snowballMakeSeconds = 1.2f, throwWindupSeconds = .3f, damage = 30, projectileSpeed = 7f },
            new PenguinStats { type = PenguinType.Chinstrap, cost = 5, hp = 180, moveSpeed = 1.45f, attackRange = 4.2f, snowballMakeSeconds = 1.8f, throwWindupSeconds = .36f, damage = 45, projectileSpeed = 6f },
            new PenguinStats { type = PenguinType.Emperor, cost = 7, hp = 480, moveSpeed = 1.05f, attackRange = 2.3f, snowballMakeSeconds = 2.2f, throwWindupSeconds = .46f, damage = 65, projectileSpeed = 5.5f },
            new PenguinStats { type = PenguinType.King, cost = 10, hp = 950, moveSpeed = .85f, attackRange = 3.2f, snowballMakeSeconds = 2.6f, throwWindupSeconds = .62f, damage = 110, projectileSpeed = 5.1f },
        };

        public event Action<int, int> CostChanged;
        public event Action<float, float> CheerChanged;
        public event Action<PenguinType?> SelectionChanged;

        public int CurrentCost { get; private set; } = 4;
        public float Cheer { get; private set; }
        public PenguinType? SelectedType { get; private set; }

        private float costAccumulator;
        private readonly Dictionary<PenguinType, PenguinStats> statsByType = new();

        public float SnowballCraftMultiplier
        {
            get
            {
                var normalized = maxCheer <= 0 ? 0 : Mathf.Clamp01(Cheer / maxCheer);
                return Mathf.Lerp(1f, maxCheerCraftMultiplier, normalized);
            }
        }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            statsByType.Clear();
            foreach (var stats in unitStats)
                statsByType[stats.type] = stats;
        }

        private void Start()
        {
            CostChanged?.Invoke(CurrentCost, maxCost);
            CheerChanged?.Invoke(Cheer, maxCheer);
        }

        private void Update()
        {
            costAccumulator += costPerSecond * Time.deltaTime;
            if (costAccumulator >= 1f && CurrentCost < maxCost)
            {
                var add = Mathf.FloorToInt(costAccumulator);
                costAccumulator -= add;
                CurrentCost = Mathf.Min(maxCost, CurrentCost + add);
                CostChanged?.Invoke(CurrentCost, maxCost);
            }

            if (Cheer > 0f)
            {
                Cheer = Mathf.Max(0f, Cheer - cheerDecayPerSecond * Time.deltaTime);
                CheerChanged?.Invoke(Cheer, maxCheer);
            }
        }

        public PenguinStats GetStats(PenguinType type) => statsByType[type];

        public void Select(PenguinType type)
        {
            if (!statsByType.TryGetValue(type, out var stats) || CurrentCost < stats.cost)
                return;

            SelectedType = SelectedType == type ? null : type;
            SelectionChanged?.Invoke(SelectedType);
        }

        public void CancelSelection()
        {
            SelectedType = null;
            SelectionChanged?.Invoke(null);
        }

        public bool TrySpawnSelected(Vector3 worldPosition)
        {
            if (SelectedType is not PenguinType type)
                return false;

            var stats = statsByType[type];
            if (CurrentCost < stats.cost)
                return false;

            var prefab = FindPrefab(playerPrefabs, type);
            if (prefab == null)
                return false;

            CurrentCost -= stats.cost;
            CostChanged?.Invoke(CurrentCost, maxCost);

            var unit = Instantiate(prefab, worldPosition, Quaternion.identity, playerSpawnRoot);
            unit.Initialize(this, stats, true, snowballPrefab);

            CancelSelection();
            return true;
        }

        public void TapCheer()
        {
            Cheer = Mathf.Min(maxCheer, Cheer + 1f);
            CheerChanged?.Invoke(Cheer, maxCheer);
        }

        private static PenguinUnit FindPrefab(IEnumerable<PenguinUnit> prefabs, PenguinType type)
        {
            foreach (var prefab in prefabs)
                if (prefab != null && prefab.Type == type)
                    return prefab;

            return null;
        }
    }
}
