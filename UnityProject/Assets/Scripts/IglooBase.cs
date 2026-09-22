using System;
using UnityEngine;

namespace PenguinSnowball
{
    public sealed class IglooBase : MonoBehaviour
    {
        [SerializeField] private bool isPlayer;
        [SerializeField] private float maxHp = 40f;

        public bool IsPlayer => isPlayer;
        public float Hp { get; private set; }
        public float MaxHp => maxHp;
        public bool IsDestroyed => Hp <= 0f;

        public event Action<IglooBase> Changed;

        private void Awake()
        {
            Hp = maxHp;
        }

        public void Configure(bool player, float hp = 40f)
        {
            isPlayer = player;
            maxHp = hp;
            Hp = maxHp;
        }

        public void TakeDamage(float amount)
        {
            if (IsDestroyed)
                return;

            Hp = Mathf.Max(0f, Hp - Mathf.Max(0f, amount));
            Changed?.Invoke(this);

            if (IsDestroyed)
                PenguinBattleController.Instance?.NotifyBaseDestroyed(this);
        }
    }
}
