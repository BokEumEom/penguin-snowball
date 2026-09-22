using UnityEngine;
using UnityEngine.EventSystems;

namespace PenguinSnowball
{
    public sealed class BattlefieldInput : MonoBehaviour, IPointerDownHandler
    {
        [SerializeField] private RectTransform battlefieldRect;
        [SerializeField] private Vector2 playerWorldX = new(-6.2f, -.45f);
        [SerializeField] private Vector2 worldY = new(-2.15f, 1.65f);

        public void OnPointerDown(PointerEventData eventData)
        {
            var battle = PenguinBattleController.Instance;
            if (battle == null)
                return;

            if (eventData.button == PointerEventData.InputButton.Right)
            {
                battle.CancelSelection();
                return;
            }

            if (battlefieldRect == null)
                battlefieldRect = transform as RectTransform;

            if (battlefieldRect == null)
                return;

            if (!RectTransformUtility.ScreenPointToLocalPointInRectangle(
                    battlefieldRect,
                    eventData.position,
                    eventData.pressEventCamera,
                    out var local))
                return;

            var rect = battlefieldRect.rect;
            var nx = Mathf.InverseLerp(rect.xMin, rect.xMax, local.x);
            var ny = Mathf.InverseLerp(rect.yMin, rect.yMax, local.y);

            if (nx > .47f || ny < .07f || ny > .93f)
                return;

            var world = new Vector3(
                Mathf.Lerp(playerWorldX.x, playerWorldX.y, nx / .47f),
                Mathf.Lerp(worldY.x, worldY.y, ny),
                0f);

            battle.TrySpawnSelected(world);
        }
    }
}
