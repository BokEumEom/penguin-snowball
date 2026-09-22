using UnityEngine;
using UnityEngine.EventSystems;

namespace PenguinSnowball
{
    public sealed class BattlefieldInput : MonoBehaviour, IPointerDownHandler
    {
        [SerializeField] private Camera worldCamera;
        [SerializeField] private RectTransform battlefieldRect;
        [SerializeField] private Vector2 worldMin = new(-7.5f, -2.4f);
        [SerializeField] private Vector2 worldMax = new(-.6f, 2.1f);

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

            if (battlefieldRect == null || worldCamera == null)
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

            // Deployment is restricted to the player's half.
            if (nx > .46f || ny < .08f || ny > .92f)
                return;

            var world = new Vector3(
                Mathf.Lerp(worldMin.x, worldMax.x, nx / .46f),
                Mathf.Lerp(worldMin.y, worldMax.y, ny),
                0f);

            battle.TrySpawnSelected(world);
        }
    }
}
