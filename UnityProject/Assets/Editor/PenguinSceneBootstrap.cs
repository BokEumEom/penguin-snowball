#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace PenguinSnowball.EditorTools
{
    public static class PenguinSceneBootstrap
    {
        private const string SceneRoot = "Assets/Scenes";

        [MenuItem("Tools/Penguin Snowball/Bootstrap Reference Scenes")]
        public static void Bootstrap()
        {
            Directory.CreateDirectory(SceneRoot);
            CreateTitleScene();
            CreateBattleScene();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("Penguin Snowball: Title and Battle scene skeletons created.");
        }

        private static void CreateTitleScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            var cameraGo = new GameObject("Main Camera", typeof(Camera));
            cameraGo.tag = "MainCamera";
            var camera = cameraGo.GetComponent<Camera>();
            camera.orthographic = true;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color32(250, 246, 233, 255);

            var canvas = CreateCanvas("TitleCanvas");
            var safe = CreateRect("SafeArea", canvas.transform);
            safe.gameObject.AddComponent<ResponsiveSafeArea>();

            var title = CreateText("Title", safe, "펭귄\n눈싸움", 96, TextAnchor.MiddleCenter);
            SetAnchors(title.rectTransform, new Vector2(.2f, .63f), new Vector2(.8f, .88f));

            var artRoot = CreateRect("PenguinGroupArt", safe);
            SetAnchors(artRoot, new Vector2(.18f, .34f), new Vector2(.82f, .66f));
            artRoot.gameObject.AddComponent<LayoutElement>();
            CreateText("ArtPlaceholder", artRoot, "IMPORT FINAL HAND-DRAWN PENGUIN GROUP SPRITE HERE", 22, TextAnchor.MiddleCenter);

            var startButton = CreateButton("StartButton", safe, "시작");
            SetAnchors(startButton.GetComponent<RectTransform>(), new Vector2(.36f, .22f), new Vector2(.64f, .31f));
            startButton.GetComponent<Image>().color = new Color32(22, 184, 212, 255);

            var secondary = CreateRect("SecondaryControls", safe);
            SetAnchors(secondary, new Vector2(.2f, .07f), new Vector2(.8f, .18f));
            var layout = secondary.gameObject.AddComponent<HorizontalLayoutGroup>();
            layout.childAlignment = TextAnchor.MiddleCenter;
            layout.spacing = 12;
            layout.childForceExpandWidth = false;
            layout.childForceExpandHeight = false;

            CreateButton("DifficultyEasy", secondary, "쉬움");
            CreateButton("DifficultyNormal", secondary, "보통");
            CreateButton("DifficultyHard", secondary, "어려움");
            CreateButton("Time2m", secondary, "2분");
            CreateButton("Time3m", secondary, "3분");
            CreateButton("Time5m", secondary, "5분");

            EditorSceneManager.SaveScene(scene, $"{SceneRoot}/Title.unity");
        }

        private static void CreateBattleScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            var cameraGo = new GameObject("Main Camera", typeof(Camera));
            cameraGo.tag = "MainCamera";
            var camera = cameraGo.GetComponent<Camera>();
            camera.orthographic = true;
            camera.orthographicSize = 5.4f;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color32(250, 246, 233, 255);

            new GameObject("BattleController", typeof(PenguinBattleController));

            var world = new GameObject("World");
            new GameObject("PlayerBase").transform.SetParent(world.transform);
            new GameObject("Units").transform.SetParent(world.transform);
            new GameObject("Projectiles").transform.SetParent(world.transform);
            new GameObject("EnemyBase").transform.SetParent(world.transform);

            var canvas = CreateCanvas("BattleCanvas");
            var safe = CreateRect("SafeArea", canvas.transform);
            safe.gameObject.AddComponent<ResponsiveSafeArea>();

            var top = CreateRect("TopHUD", safe);
            SetAnchors(top, new Vector2(0, .88f), new Vector2(1, 1));
            CreateText("Timer", top, "3:00", 42, TextAnchor.UpperCenter);

            var battlefieldInput = CreateRect("BattlefieldInput", safe);
            SetAnchors(battlefieldInput, new Vector2(0, .16f), new Vector2(1, .9f));
            var transparent = battlefieldInput.gameObject.AddComponent<Image>();
            transparent.color = new Color(1, 1, 1, 0);
            transparent.raycastTarget = true;
            battlefieldInput.gameObject.AddComponent<BattlefieldInput>();

            var bottom = CreateRect("BottomHUD", safe);
            SetAnchors(bottom, new Vector2(0, 0), new Vector2(1, .18f));
            var bottomImage = bottom.gameObject.AddComponent<Image>();
            bottomImage.color = new Color32(250, 246, 233, 255);

            CreateText("PlayerHP", bottom, "30", 30, TextAnchor.MiddleLeft);
            CreateText("EnemyHP", bottom, "30", 30, TextAnchor.MiddleRight);

            var cheer = CreateButton("CheerButton", bottom, "응원!!");
            SetAnchors(cheer.GetComponent<RectTransform>(), new Vector2(.08f, .15f), new Vector2(.22f, .85f));
            cheer.GetComponent<Image>().color = new Color32(255, 213, 26, 255);

            var units = CreateRect("UnitButtons", bottom);
            SetAnchors(units, new Vector2(.27f, .12f), new Vector2(.73f, .88f));
            var layout = units.gameObject.AddComponent<HorizontalLayoutGroup>();
            layout.childAlignment = TextAnchor.MiddleCenter;
            layout.spacing = 8;
            layout.childForceExpandWidth = true;
            layout.childForceExpandHeight = true;

            CreateButton("Small", units, "1");
            CreateButton("Gentoo", units, "3");
            CreateButton("Chinstrap", units, "5");
            CreateButton("Emperor", units, "7");
            CreateButton("King", units, "10");

            EnsureEventSystem();
            EditorSceneManager.SaveScene(scene, $"{SceneRoot}/Battle.unity");
        }

        private static Canvas CreateCanvas(string name)
        {
            var go = new GameObject(name, typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            var canvas = go.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;

            var scaler = go.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = .5f;

            return canvas;
        }

        private static RectTransform CreateRect(string name, Transform parent)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            return rect;
        }

        private static Text CreateText(string name, Transform parent, string value, int fontSize, TextAnchor alignment)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var text = go.GetComponent<Text>();
            text.text = value;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = fontSize;
            text.fontStyle = FontStyle.Bold;
            text.alignment = alignment;
            text.color = new Color32(23, 23, 23, 255);

            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            return text;
        }

        private static Button CreateButton(string name, Transform parent, string label)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            image.color = Color.white;

            var button = go.GetComponent<Button>();
            var text = CreateText("Label", go.transform, label, 28, TextAnchor.MiddleCenter);
            text.raycastTarget = false;

            var outline = go.AddComponent<Outline>();
            outline.effectColor = new Color32(23, 23, 23, 255);
            outline.effectDistance = new Vector2(3, -3);

            return button;
        }

        private static void SetAnchors(RectTransform rect, Vector2 min, Vector2 max)
        {
            rect.anchorMin = min;
            rect.anchorMax = max;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void EnsureEventSystem()
        {
            if (Object.FindFirstObjectByType<EventSystem>() != null)
                return;

            new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
        }
    }
}
#endif
