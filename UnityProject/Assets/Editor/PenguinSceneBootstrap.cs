#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace PenguinSnowball.EditorTools
{
    public static class PenguinSceneBootstrap
    {
        private const string SceneRoot = "Assets/Scenes";
        private const string ArtRoot = "Assets/Art/Generated";
        private const string PrefabRoot = "Assets/Prefabs";
        private const string UnitPrefabRoot = "Assets/Prefabs/Units";
        private const string AnimationRoot = "Assets/Animations";
        private const string MaterialRoot = "Assets/Materials";

        private static readonly Color32 Cream = new(252, 248, 231, 255);
        private static readonly Color32 Ink = new(28, 27, 27, 255);
        private static readonly Color32 Muted = new(126, 124, 115, 255);
        private static readonly Color32 Cyan = new(8, 177, 207, 255);
        private static readonly Color32 Red = new(244, 52, 57, 255);
        private static readonly Color32 Yellow = new(255, 204, 20, 255);

        private static readonly PenguinType[] Types =
        {
            PenguinType.Small,
            PenguinType.Gentoo,
            PenguinType.Chinstrap,
            PenguinType.Emperor,
            PenguinType.King
        };

        private static readonly string[] SpriteNames =
        {
            "penguin_small_blue.png",
            "penguin_gentoo_blue.png",
            "penguin_chinstrap_blue.png",
            "penguin_emperor_blue.png",
            "penguin_king_blue.png"
        };

        private static readonly int[] Costs = { 1, 3, 5, 7, 10 };
        private static readonly float[] VisualScales = { .28f, .31f, .34f, .38f, .43f };

        [MenuItem("Tools/Penguin Snowball/Bootstrap Reference Scenes")]
        public static void Bootstrap()
        {
            ReferenceArtInstaller.EnsureInstalled();

            EnsureFolder(SceneRoot);
            EnsureFolder(PrefabRoot);
            EnsureFolder(UnitPrefabRoot);
            EnsureFolder(AnimationRoot);
            EnsureFolder(MaterialRoot);

            var circleSprite = EnsureCircleFrameSprite();
            var enemyMaterial = EnsureEnemyMaterial();
            var snowballPrefab = EnsureSnowballPrefab();
            var unitPrefabs = EnsureUnitPrefabs(enemyMaterial);

            CreateTitleScene();
            CreateBattleScene(unitPrefabs, snowballPrefab, enemyMaterial, circleSprite);

            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene($"{SceneRoot}/Title.unity", true),
                new EditorBuildSettingsScene($"{SceneRoot}/Battle.unity", true)
            };

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            EditorSceneManager.OpenScene($"{SceneRoot}/Title.unity");

            Debug.Log(
                "Penguin Snowball reference implementation created. " +
                "Open Title/Battle Game View at 16:9 and compare with the captured reference.");
        }

        private static void CreateTitleScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            CreateCamera("Main Camera", Cream, 5f);

            var canvas = CreateCanvas("TitleCanvas");
            canvas.gameObject.AddComponent<ReferenceFontApplier>();
            var safe = CreateRect("SafeArea", canvas.transform);
            safe.gameObject.AddComponent<ResponsiveSafeArea>();

            // Large empty space is intentional: this is a game title screen, not an app dashboard.
            var title = CreateText("Title", safe, "펭귄 눈싸움", 92, TextAnchor.MiddleCenter, Ink);
            SetAnchors(title.rectTransform, new Vector2(.25f, .79f), new Vector2(.75f, .95f));
            title.fontStyle = FontStyle.Bold;

            var subtitle = CreateText("Subtitle", safe, "Penguin YUKIGASSEN", 36, TextAnchor.MiddleCenter, Ink);
            SetAnchors(subtitle.rectTransform, new Vector2(.31f, .72f), new Vector2(.69f, .80f));
            subtitle.fontStyle = FontStyle.Italic;

            var gear = CreateTextButton("SettingsButton", safe, "⚙", 58, Ink, Color.clear);
            SetAnchors(gear.GetComponent<RectTransform>(), new Vector2(.915f, .885f), new Vector2(.982f, .975f));

            var igloo = CreateUiImage("HomeIgloo", safe, LoadSprite("igloo_home_blue.png"));
            SetAnchors(igloo.rectTransform, new Vector2(.405f, .29f), new Vector2(.595f, .57f));
            igloo.preserveAspect = true;

            var easy = CreateTextButton("EasyButton", safe, "쉬움", 42, Muted, Color.clear);
            SetAnchors(easy.GetComponent<RectTransform>(), new Vector2(.18f, .055f), new Vector2(.34f, .16f));

            var normal = CreateTextButton("NormalButton", safe, "보통", 42, Muted, Color.clear);
            SetAnchors(normal.GetComponent<RectTransform>(), new Vector2(.42f, .055f), new Vector2(.58f, .16f));

            var hard = CreateTextButton("HardButton", safe, "어려움", 42, Muted, Color.clear);
            SetAnchors(hard.GetComponent<RectTransform>(), new Vector2(.66f, .055f), new Vector2(.82f, .16f));

            var timeLabel = CreateText("TimeLabel", safe, "제한시간", 38, TextAnchor.MiddleCenter, Muted);
            SetAnchors(timeLabel.rectTransform, new Vector2(.765f, .315f), new Vector2(.955f, .405f));

            var prev = CreateTextButton("TimePreviousButton", safe, "＜", 52, new Color32(174, 172, 163, 255), Color.clear);
            SetAnchors(prev.GetComponent<RectTransform>(), new Vector2(.755f, .205f), new Vector2(.815f, .305f));

            var timeValue = CreateText("TimeValue", safe, "3 분", 46, TextAnchor.MiddleCenter, Ink);
            SetAnchors(timeValue.rectTransform, new Vector2(.815f, .205f), new Vector2(.905f, .305f));

            var next = CreateTextButton("TimeNextButton", safe, "＞", 52, new Color32(174, 172, 163, 255), Color.clear);
            SetAnchors(next.GetComponent<RectTransform>(), new Vector2(.905f, .205f), new Vector2(.965f, .305f));

            var version = CreateText("Version", safe, "ver. 1.0.1", 26, TextAnchor.MiddleLeft, Muted);
            SetAnchors(version.rectTransform, new Vector2(.012f, .015f), new Vector2(.15f, .075f));

            var controller = canvas.gameObject.AddComponent<TitleMenuController>();
            var so = new SerializedObject(controller);
            so.FindProperty("easyButton").objectReferenceValue = easy.GetComponent<Button>();
            so.FindProperty("normalButton").objectReferenceValue = normal.GetComponent<Button>();
            so.FindProperty("hardButton").objectReferenceValue = hard.GetComponent<Button>();
            so.FindProperty("timePreviousButton").objectReferenceValue = prev.GetComponent<Button>();
            so.FindProperty("timeNextButton").objectReferenceValue = next.GetComponent<Button>();
            so.FindProperty("timeValueText").objectReferenceValue = timeValue;
            so.ApplyModifiedPropertiesWithoutUndo();

            EnsureEventSystem();
            EditorSceneManager.SaveScene(scene, $"{SceneRoot}/Title.unity");
        }

        private static void CreateBattleScene(
            PenguinUnit[] unitPrefabs,
            SnowballProjectile snowballPrefab,
            Material enemyMaterial,
            Sprite circleSprite)
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var camera = CreateCamera("Main Camera", Cream, 4.6f);
            camera.transform.position = new Vector3(0, 0, -10);

            var world = new GameObject("World");

            var playerBase = CreateIgloo(
                "PlayerBase",
                world.transform,
                LoadSprite("igloo_battle_blue.png"),
                new Vector3(-6.55f, -1.35f, 0f),
                true,
                null);

            var enemyBase = CreateIgloo(
                "EnemyBase",
                world.transform,
                LoadSprite("igloo_battle_blue.png"),
                new Vector3(6.55f, 1.55f, 0f),
                false,
                enemyMaterial);

            var playerSpawnRoot = new GameObject("PlayerUnits").transform;
            playerSpawnRoot.SetParent(world.transform, false);
            playerSpawnRoot.position = new Vector3(-5.4f, -1.1f, 0);

            var enemySpawnRoot = new GameObject("EnemyUnits").transform;
            enemySpawnRoot.SetParent(world.transform, false);
            enemySpawnRoot.position = new Vector3(5.25f, 1.1f, 0);

            var projectileRoot = new GameObject("Projectiles").transform;
            projectileRoot.SetParent(world.transform, false);

            var controllerGo = new GameObject("BattleController");
            var controller = controllerGo.AddComponent<PenguinBattleController>();
            var controllerSo = new SerializedObject(controller);
            controllerSo.FindProperty("playerSpawnRoot").objectReferenceValue = playerSpawnRoot;
            controllerSo.FindProperty("enemySpawnRoot").objectReferenceValue = enemySpawnRoot;
            controllerSo.FindProperty("snowballPrefab").objectReferenceValue = snowballPrefab;
            controllerSo.FindProperty("playerBase").objectReferenceValue = playerBase;
            controllerSo.FindProperty("enemyBase").objectReferenceValue = enemyBase;

            var prefabArray = controllerSo.FindProperty("unitPrefabs");
            prefabArray.arraySize = unitPrefabs.Length;
            for (var i = 0; i < unitPrefabs.Length; i++)
                prefabArray.GetArrayElementAtIndex(i).objectReferenceValue = unitPrefabs[i];

            controllerSo.ApplyModifiedPropertiesWithoutUndo();

            var canvas = CreateCanvas("BattleCanvas");
            canvas.gameObject.AddComponent<ReferenceFontApplier>();
            var safe = CreateRect("SafeArea", canvas.transform);
            safe.gameObject.AddComponent<ResponsiveSafeArea>();

            var battlefield = CreateRect("BattlefieldInput", safe);
            SetAnchors(battlefield, new Vector2(0, .19f), new Vector2(1, 1));
            var battlefieldImage = battlefield.gameObject.AddComponent<Image>();
            battlefieldImage.color = Color.clear;
            battlefieldImage.raycastTarget = true;
            battlefield.gameObject.AddComponent<BattlefieldInput>();

            var timer = CreateText("Timer", safe, "3:00", 42, TextAnchor.MiddleCenter, Ink);
            SetAnchors(timer.rectTransform, new Vector2(.44f, .93f), new Vector2(.56f, .995f));

            var bottom = CreateRect("BottomHUD", safe);
            SetAnchors(bottom, new Vector2(0, 0), new Vector2(1, .205f));

            // Player base HP: cloud over large number, matching the captured HUD.
            var playerCloud = CreateUiImage("PlayerCloud", bottom, LoadSprite("cloud.png"));
            SetAnchors(playerCloud.rectTransform, new Vector2(.035f, .37f), new Vector2(.105f, .82f));
            playerCloud.preserveAspect = true;

            var playerHp = CreateText("PlayerHP", bottom, "40", 42, TextAnchor.MiddleCenter, Ink);
            SetAnchors(playerHp.rectTransform, new Vector2(.035f, .08f), new Vector2(.105f, .39f));

            var enemyCloud = CreateUiImage("EnemyCloud", bottom, LoadSprite("cloud.png"));
            SetAnchors(enemyCloud.rectTransform, new Vector2(.895f, .37f), new Vector2(.965f, .82f));
            enemyCloud.preserveAspect = true;

            var enemyHp = CreateText("EnemyHP", bottom, "40", 42, TextAnchor.MiddleCenter, Ink);
            SetAnchors(enemyHp.rectTransform, new Vector2(.895f, .08f), new Vector2(.965f, .39f));

            var cheerLabelTop = CreateText("CheerTop", bottom, "응원", 25, TextAnchor.MiddleCenter, Ink);
            SetAnchors(cheerLabelTop.rectTransform, new Vector2(.125f, .45f), new Vector2(.205f, .68f));

            var cheerButton = CreateSpriteButton("CheerButton", bottom, circleSprite, Color.white);
            SetAnchors(cheerButton.GetComponent<RectTransform>(), new Vector2(.135f, .16f), new Vector2(.195f, .57f));
            AddPortrait(cheerButton.transform, LoadSprite("penguin_small_blue.png"), .13f, .10f, .87f, .88f);

            var cheerLabelBottom = CreateText("CheerBottom", bottom, "연타!!", 22, TextAnchor.MiddleCenter, Ink);
            SetAnchors(cheerLabelBottom.rectTransform, new Vector2(.125f, .015f), new Vector2(.205f, .22f));

            var cheerSegments = CreateVerticalSegments(
                "CheerMeter",
                bottom,
                new Vector2(.102f, .08f),
                new Vector2(.121f, .75f),
                12,
                Yellow,
                new Color32(250, 246, 233, 255));

            // Cost meter.
            var costBadge = CreateUiImage("CostBadge", bottom, circleSprite);
            SetAnchors(costBadge.rectTransform, new Vector2(.273f, .58f), new Vector2(.318f, .91f));
            costBadge.color = Color.white;

            var costText = CreateText("CostText", costBadge.transform, "4", 34, TextAnchor.MiddleCenter, Cyan);
            Stretch(costText.rectTransform);

            var costSegments = CreateHorizontalSegments(
                "CostMeter",
                bottom,
                new Vector2(.307f, .66f),
                new Vector2(.68f, .84f),
                10,
                Cyan,
                new Color32(250, 246, 233, 255));

            var unitButtons = new Button[5];
            var centers = new[] { .345f, .425f, .505f, .585f, .665f };
            for (var i = 0; i < 5; i++)
            {
                var cx = centers[i];
                var button = CreateSpriteButton($"Unit_{Types[i]}", bottom, circleSprite, Color.white);
                SetAnchors(button.GetComponent<RectTransform>(), new Vector2(cx - .034f, .08f), new Vector2(cx + .034f, .55f));
                AddPortrait(button.transform, LoadSprite(SpriteNames[i]), .08f, .06f, .92f, .92f);
                unitButtons[i] = button.GetComponent<Button>();

                var badge = CreateUiImage($"CostBadge_{Costs[i]}", bottom, circleSprite);
                SetAnchors(badge.rectTransform, new Vector2(cx - .016f, .005f), new Vector2(cx + .016f, .22f));
                badge.color = Color.white;
                var cost = CreateText("Value", badge.transform, Costs[i].ToString(), 24, TextAnchor.MiddleCenter, Ink);
                Stretch(cost.rectTransform);
            }

            var hud = canvas.gameObject.AddComponent<BattleHudController>();
            var hudSo = new SerializedObject(hud);
            hudSo.FindProperty("timerText").objectReferenceValue = timer;
            hudSo.FindProperty("playerHpText").objectReferenceValue = playerHp;
            hudSo.FindProperty("enemyHpText").objectReferenceValue = enemyHp;
            hudSo.FindProperty("costText").objectReferenceValue = costText;
            hudSo.FindProperty("cheerButton").objectReferenceValue = cheerButton.GetComponent<Button>();

            AssignObjectArray(hudSo.FindProperty("unitButtons"), unitButtons);
            AssignObjectArray(hudSo.FindProperty("costSegments"), costSegments);
            AssignObjectArray(hudSo.FindProperty("cheerSegments"), cheerSegments);
            hudSo.ApplyModifiedPropertiesWithoutUndo();

            CreateResultOverlay(canvas.transform);

            EnsureEventSystem();
            EditorSceneManager.SaveScene(scene, $"{SceneRoot}/Battle.unity");
        }

        private static IglooBase CreateIgloo(
            string name,
            Transform parent,
            Sprite sprite,
            Vector3 position,
            bool isPlayer,
            Material material)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.transform.position = position;
            go.transform.localScale = Vector3.one * .72f;

            var renderer = go.AddComponent<SpriteRenderer>();
            renderer.sprite = sprite;
            renderer.sortingOrder = 0;
            if (material != null)
                renderer.sharedMaterial = material;

            var collider = go.AddComponent<BoxCollider2D>();
            collider.size = new Vector2(2.6f, 1.65f);
            collider.offset = new Vector2(0, -.15f);

            var igloo = go.AddComponent<IglooBase>();
            var so = new SerializedObject(igloo);
            so.FindProperty("isPlayer").boolValue = isPlayer;
            so.FindProperty("maxHp").floatValue = 40f;
            so.ApplyModifiedPropertiesWithoutUndo();
            return igloo;
        }

        private static PenguinUnit[] EnsureUnitPrefabs(Material enemyMaterial)
        {
            var prefabs = new PenguinUnit[Types.Length];
            var snowballSprite = LoadSprite("snowball.png");

            for (var i = 0; i < Types.Length; i++)
            {
                var type = Types[i];
                var path = $"{UnitPrefabRoot}/Penguin_{type}.prefab";
                var root = new GameObject($"Penguin_{type}");

                var animator = root.AddComponent<Animator>();
                animator.runtimeAnimatorController = EnsureAnimator(type, VisualScales[i]);

                var collider = root.AddComponent<CircleCollider2D>();
                collider.radius = .38f;

                var unit = root.AddComponent<PenguinUnit>();

                var visual = new GameObject("Visual").transform;
                visual.SetParent(root.transform, false);
                visual.localScale = Vector3.one * VisualScales[i];

                var spriteRenderer = visual.gameObject.AddComponent<SpriteRenderer>();
                spriteRenderer.sprite = LoadSprite(SpriteNames[i]);
                spriteRenderer.sortingOrder = 10;

                var throwOrigin = new GameObject("ThrowOrigin").transform;
                throwOrigin.SetParent(root.transform, false);
                throwOrigin.localPosition = new Vector3(.52f, .14f, 0);

                var held = new GameObject("HeldSnowball");
                held.transform.SetParent(throwOrigin, false);
                held.transform.localPosition = Vector3.zero;
                held.transform.localScale = Vector3.one * .2f;
                var heldRenderer = held.AddComponent<SpriteRenderer>();
                heldRenderer.sprite = snowballSprite;
                heldRenderer.sortingOrder = 12;
                held.SetActive(false);

                var so = new SerializedObject(unit);
                so.FindProperty("type").enumValueIndex = (int)type;
                so.FindProperty("animator").objectReferenceValue = animator;
                so.FindProperty("spriteRenderer").objectReferenceValue = spriteRenderer;
                so.FindProperty("visualRoot").objectReferenceValue = visual;
                so.FindProperty("throwOrigin").objectReferenceValue = throwOrigin;
                so.FindProperty("heldSnowball").objectReferenceValue = held;
                so.FindProperty("enemyRecolorMaterial").objectReferenceValue = enemyMaterial;
                so.FindProperty("targetMask").intValue = ~0;
                so.ApplyModifiedPropertiesWithoutUndo();

                var prefab = PrefabUtility.SaveAsPrefabAsset(root, path);
                prefabs[i] = prefab.GetComponent<PenguinUnit>();
                UnityEngine.Object.DestroyImmediate(root);
            }

            return prefabs;
        }

        private static RuntimeAnimatorController EnsureAnimator(PenguinType type, float scale)
        {
            var controllerPath = $"{AnimationRoot}/{type}.controller";
            AssetDatabase.DeleteAsset(controllerPath);

            var controller = AnimatorController.CreateAnimatorControllerAtPath(controllerPath);
            controller.AddParameter("Walk", AnimatorControllerParameterType.Bool);
            controller.AddParameter("MakeSnowball", AnimatorControllerParameterType.Trigger);
            controller.AddParameter("Throw", AnimatorControllerParameterType.Trigger);
            controller.AddParameter("Hit", AnimatorControllerParameterType.Trigger);
            controller.AddParameter("Defeat", AnimatorControllerParameterType.Trigger);

            var machine = controller.layers[0].stateMachine;
            var idle = machine.AddState("Idle");
            var walk = machine.AddState("Walk");
            var make = machine.AddState("MakeSnowball");
            var throwState = machine.AddState("Throw");
            var hit = machine.AddState("Hit");
            var defeat = machine.AddState("Defeat");
            machine.defaultState = idle;

            var motion = MotionProfile(type);

            idle.motion = CreateMotionClip(type, "Idle", .85f, scale, 0f, motion.idleBob, 0f, true);
            walk.motion = CreateMotionClip(type, "Walk", motion.walkDuration, scale, motion.walkX, motion.walkY, motion.walkSquash, true);
            make.motion = CreateMotionClip(type, "Make", .5f, scale, .018f, -.025f, .055f, true);
            throwState.motion = CreateThrowClip(type, scale, motion.throwPower);
            hit.motion = CreateHitClip(type, scale);
            defeat.motion = CreateDefeatClip(type, scale);

            AddBoolTransition(idle, walk, "Walk", true);
            AddBoolTransition(walk, idle, "Walk", false);
            AddTriggerTransition(machine, make, "MakeSnowball");
            AddTriggerTransition(machine, throwState, "Throw");
            AddTriggerTransition(machine, hit, "Hit");
            AddTriggerTransition(machine, defeat, "Defeat");

            AddExitToIdle(throwState, idle, .94f);
            AddExitToIdle(hit, idle, .9f);

            return controller;
        }

        private static (float walkDuration, float walkX, float walkY, float walkSquash, float idleBob, float throwPower) MotionProfile(PenguinType type)
        {
            return type switch
            {
                PenguinType.Small => (.38f, .065f, .075f, .07f, .018f, 1f),
                PenguinType.Gentoo => (.27f, .05f, .045f, .025f, .01f, 1.05f),
                PenguinType.Chinstrap => (.5f, .025f, .035f, .018f, .009f, 1f),
                PenguinType.Emperor => (.58f, .025f, .028f, .075f, .008f, 1.18f),
                PenguinType.King => (.66f, .02f, .032f, .04f, .008f, 1.42f),
                _ => (.45f, .04f, .04f, .03f, .01f, 1f)
            };
        }

        private static AnimationClip CreateMotionClip(
            PenguinType type,
            string suffix,
            float duration,
            float scale,
            float xAmount,
            float yAmount,
            float squash,
            bool loop)
        {
            var clip = new AnimationClip { frameRate = 24f, name = $"{type}_{suffix}" };

            var x = new AnimationCurve(
                new Keyframe(0, 0),
                new Keyframe(duration * .25f, xAmount),
                new Keyframe(duration * .5f, 0),
                new Keyframe(duration * .75f, -xAmount),
                new Keyframe(duration, 0));

            var y = new AnimationCurve(
                new Keyframe(0, 0),
                new Keyframe(duration * .25f, yAmount),
                new Keyframe(duration * .5f, 0),
                new Keyframe(duration * .75f, yAmount),
                new Keyframe(duration, 0));

            var sx = new AnimationCurve(
                new Keyframe(0, scale),
                new Keyframe(duration * .25f, scale * (1f + squash)),
                new Keyframe(duration * .5f, scale),
                new Keyframe(duration * .75f, scale * (1f + squash)),
                new Keyframe(duration, scale));

            var sy = new AnimationCurve(
                new Keyframe(0, scale),
                new Keyframe(duration * .25f, scale * (1f - squash)),
                new Keyframe(duration * .5f, scale),
                new Keyframe(duration * .75f, scale * (1f - squash)),
                new Keyframe(duration, scale));

            SetTransformCurves(clip, x, y, sx, sy);
            SetLoop(clip, loop);

            var path = $"{AnimationRoot}/{type}_{suffix}.anim";
            AssetDatabase.DeleteAsset(path);
            AssetDatabase.CreateAsset(clip, path);
            return clip;
        }

        private static AnimationClip CreateThrowClip(PenguinType type, float scale, float power)
        {
            var duration = .58f;
            var clip = new AnimationClip { frameRate = 24f, name = $"{type}_Throw" };

            var x = new AnimationCurve(
                new Keyframe(0, 0),
                new Keyframe(.19f, -.08f * power),
                new Keyframe(.38f, .13f * power),
                new Keyframe(duration, 0));

            var y = new AnimationCurve(
                new Keyframe(0, 0),
                new Keyframe(.2f, -.025f),
                new Keyframe(.39f, .105f * power),
                new Keyframe(duration, 0));

            var sx = new AnimationCurve(
                new Keyframe(0, scale),
                new Keyframe(.2f, scale * 1.08f),
                new Keyframe(.4f, scale * .96f),
                new Keyframe(duration, scale));

            var sy = new AnimationCurve(
                new Keyframe(0, scale),
                new Keyframe(.2f, scale * .92f),
                new Keyframe(.4f, scale * 1.05f),
                new Keyframe(duration, scale));

            SetTransformCurves(clip, x, y, sx, sy);
            var path = $"{AnimationRoot}/{type}_Throw.anim";
            AssetDatabase.DeleteAsset(path);
            AssetDatabase.CreateAsset(clip, path);
            return clip;
        }

        private static AnimationClip CreateHitClip(PenguinType type, float scale)
        {
            var clip = new AnimationClip { frameRate = 24f, name = $"{type}_Hit" };
            var x = new AnimationCurve(
                new Keyframe(0, 0),
                new Keyframe(.05f, -.07f),
                new Keyframe(.1f, .05f),
                new Keyframe(.18f, 0));
            var y = AnimationCurve.Constant(0, .18f, 0);
            var s = AnimationCurve.Constant(0, .18f, scale);
            SetTransformCurves(clip, x, y, s, s);
            var path = $"{AnimationRoot}/{type}_Hit.anim";
            AssetDatabase.DeleteAsset(path);
            AssetDatabase.CreateAsset(clip, path);
            return clip;
        }

        private static AnimationClip CreateDefeatClip(PenguinType type, float scale)
        {
            var clip = new AnimationClip { frameRate = 24f, name = $"{type}_Defeat" };
            var x = new AnimationCurve(new Keyframe(0, 0), new Keyframe(.7f, -.16f));
            var y = new AnimationCurve(new Keyframe(0, 0), new Keyframe(.25f, .08f), new Keyframe(.7f, -.48f));
            var sx = new AnimationCurve(new Keyframe(0, scale), new Keyframe(.7f, scale * 1.12f));
            var sy = new AnimationCurve(new Keyframe(0, scale), new Keyframe(.7f, scale * .18f));
            SetTransformCurves(clip, x, y, sx, sy);
            var path = $"{AnimationRoot}/{type}_Defeat.anim";
            AssetDatabase.DeleteAsset(path);
            AssetDatabase.CreateAsset(clip, path);
            return clip;
        }

        private static void SetTransformCurves(
            AnimationClip clip,
            AnimationCurve x,
            AnimationCurve y,
            AnimationCurve scaleX,
            AnimationCurve scaleY)
        {
            AnimationUtility.SetEditorCurve(
                clip,
                EditorCurveBinding.FloatCurve("Visual", typeof(Transform), "m_LocalPosition.x"),
                x);
            AnimationUtility.SetEditorCurve(
                clip,
                EditorCurveBinding.FloatCurve("Visual", typeof(Transform), "m_LocalPosition.y"),
                y);
            AnimationUtility.SetEditorCurve(
                clip,
                EditorCurveBinding.FloatCurve("Visual", typeof(Transform), "m_LocalScale.x"),
                scaleX);
            AnimationUtility.SetEditorCurve(
                clip,
                EditorCurveBinding.FloatCurve("Visual", typeof(Transform), "m_LocalScale.y"),
                scaleY);
        }

        private static void SetLoop(AnimationClip clip, bool loop)
        {
            var serialized = new SerializedObject(clip);
            var settings = serialized.FindProperty("m_AnimationClipSettings");
            if (settings != null)
            {
                var loopTime = settings.FindPropertyRelative("m_LoopTime");
                if (loopTime != null)
                    loopTime.boolValue = loop;
                serialized.ApplyModifiedPropertiesWithoutUndo();
            }
        }

        private static void AddBoolTransition(AnimatorState from, AnimatorState to, string parameter, bool value)
        {
            var transition = from.AddTransition(to);
            transition.duration = .04f;
            transition.hasExitTime = false;
            transition.AddCondition(
                value ? AnimatorConditionMode.If : AnimatorConditionMode.IfNot,
                0,
                parameter);
        }

        private static void AddTriggerTransition(AnimatorStateMachine machine, AnimatorState state, string trigger)
        {
            var transition = machine.AddAnyStateTransition(state);
            transition.duration = .03f;
            transition.hasExitTime = false;
            transition.AddCondition(AnimatorConditionMode.If, 0, trigger);
        }

        private static void AddExitToIdle(AnimatorState from, AnimatorState idle, float exitTime)
        {
            var transition = from.AddTransition(idle);
            transition.hasExitTime = true;
            transition.exitTime = exitTime;
            transition.duration = .03f;
        }

        private static SnowballProjectile EnsureSnowballPrefab()
        {
            var path = $"{PrefabRoot}/Snowball.prefab";
            var go = new GameObject("Snowball");
            var renderer = go.AddComponent<SpriteRenderer>();
            renderer.sprite = LoadSprite("snowball.png");
            renderer.sortingOrder = 20;
            go.transform.localScale = Vector3.one * .22f;

            var projectile = go.AddComponent<SnowballProjectile>();
            var so = new SerializedObject(projectile);
            so.FindProperty("spriteRenderer").objectReferenceValue = renderer;
            so.ApplyModifiedPropertiesWithoutUndo();

            var prefab = PrefabUtility.SaveAsPrefabAsset(go, path);
            UnityEngine.Object.DestroyImmediate(go);
            return prefab.GetComponent<SnowballProjectile>();
        }

        private static Material EnsureEnemyMaterial()
        {
            var path = $"{MaterialRoot}/EnemyRed.mat";
            var existing = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (existing != null)
                AssetDatabase.DeleteAsset(path);

            var shader = Shader.Find("PenguinSnowball/ReferenceTeamRecolor");
            if (shader == null)
                throw new InvalidOperationException("ReferenceTeamRecolor shader is not available.");

            var material = new Material(shader)
            {
                name = "EnemyRed"
            };
            material.SetColor("_SourceColor", new Color32(8, 177, 207, 255));
            material.SetColor("_TeamColor", Red);
            material.SetFloat("_Tolerance", .26f);
            AssetDatabase.CreateAsset(material, path);
            return material;
        }

        private static Sprite EnsureCircleFrameSprite()
        {
            var path = $"{ArtRoot}/ui_circle_frame.png";
            var existing = AssetDatabase.LoadAssetAtPath<Sprite>(path);
            if (existing != null)
                return existing;

            const int size = 128;
            var texture = new Texture2D(size, size, TextureFormat.RGBA32, false);
            var pixels = new Color32[size * size];
            var center = (size - 1) * .5f;

            for (var y = 0; y < size; y++)
            for (var x = 0; x < size; x++)
            {
                var dx = x - center;
                var dy = y - center;
                var d = Mathf.Sqrt(dx * dx + dy * dy);
                pixels[y * size + x] =
                    d <= 60 ? (d >= 54 ? Ink : new Color32(255, 255, 255, 255)) : new Color32(0, 0, 0, 0);
            }

            texture.SetPixels32(pixels);
            texture.Apply();
            File.WriteAllBytes(Path.Combine(Directory.GetCurrentDirectory(), path), texture.EncodeToPNG());
            UnityEngine.Object.DestroyImmediate(texture);
            AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceSynchronousImport);

            var importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer != null)
            {
                importer.textureType = TextureImporterType.Sprite;
                importer.spriteImportMode = SpriteImportMode.Single;
                importer.alphaIsTransparency = true;
                importer.mipmapEnabled = false;
                importer.textureCompression = TextureImporterCompression.Uncompressed;
                importer.SaveAndReimport();
            }

            return AssetDatabase.LoadAssetAtPath<Sprite>(path);
        }

        private static void CreateResultOverlay(Transform canvas)
        {
            var panel = CreateRect("ResultOverlay", canvas);
            SetAnchors(panel, new Vector2(.36f, .34f), new Vector2(.64f, .66f));
            var image = panel.gameObject.AddComponent<Image>();
            image.color = new Color32(252, 248, 231, 245);

            var outline = panel.gameObject.AddComponent<Outline>();
            outline.effectColor = Ink;
            outline.effectDistance = new Vector2(3, -3);

            var result = CreateText("ResultText", panel, "승리!", 56, TextAnchor.MiddleCenter, Ink);
            SetAnchors(result.rectTransform, new Vector2(.08f, .42f), new Vector2(.92f, .9f));

            var button = CreateTextButton("TitleButton", panel, "타이틀로", 28, Ink, Color.white);
            SetAnchors(button.GetComponent<RectTransform>(), new Vector2(.27f, .12f), new Vector2(.73f, .35f));

            var overlay = canvas.gameObject.AddComponent<MatchResultOverlay>();
            var so = new SerializedObject(overlay);
            so.FindProperty("panel").objectReferenceValue = panel.gameObject;
            so.FindProperty("resultText").objectReferenceValue = result;
            so.FindProperty("titleButton").objectReferenceValue = button.GetComponent<Button>();
            so.ApplyModifiedPropertiesWithoutUndo();

            panel.gameObject.SetActive(false);
        }

        private static Image[] CreateHorizontalSegments(
            string name,
            Transform parent,
            Vector2 anchorMin,
            Vector2 anchorMax,
            int count,
            Color active,
            Color inactive)
        {
            var root = CreateRect(name, parent);
            SetAnchors(root, anchorMin, anchorMax);

            var layout = root.gameObject.AddComponent<HorizontalLayoutGroup>();
            layout.spacing = 2;
            layout.padding = new RectOffset(2, 2, 2, 2);
            layout.childForceExpandWidth = true;
            layout.childForceExpandHeight = true;

            var background = root.gameObject.AddComponent<Image>();
            background.color = Ink;

            var result = new Image[count];
            for (var i = 0; i < count; i++)
            {
                var cell = new GameObject($"Segment_{i}", typeof(RectTransform), typeof(Image));
                cell.transform.SetParent(root, false);
                var image = cell.GetComponent<Image>();
                image.color = i < 4 ? active : inactive;
                result[i] = image;
            }

            return result;
        }

        private static Image[] CreateVerticalSegments(
            string name,
            Transform parent,
            Vector2 anchorMin,
            Vector2 anchorMax,
            int count,
            Color active,
            Color inactive)
        {
            var root = CreateRect(name, parent);
            SetAnchors(root, anchorMin, anchorMax);

            var layout = root.gameObject.AddComponent<VerticalLayoutGroup>();
            layout.spacing = 3;
            layout.padding = new RectOffset(2, 2, 2, 2);
            layout.childForceExpandWidth = true;
            layout.childForceExpandHeight = true;

            var background = root.gameObject.AddComponent<Image>();
            background.color = Ink;

            var result = new Image[count];
            for (var i = 0; i < count; i++)
            {
                var cell = new GameObject($"Segment_{i}", typeof(RectTransform), typeof(Image));
                cell.transform.SetParent(root, false);
                var image = cell.GetComponent<Image>();
                image.color = inactive;
                result[count - 1 - i] = image;
            }

            return result;
        }

        private static void AssignObjectArray<T>(SerializedProperty property, T[] values) where T : UnityEngine.Object
        {
            property.arraySize = values.Length;
            for (var i = 0; i < values.Length; i++)
                property.GetArrayElementAtIndex(i).objectReferenceValue = values[i];
        }

        private static void AddPortrait(Transform parent, Sprite sprite, float minX, float minY, float maxX, float maxY)
        {
            var image = CreateUiImage("Portrait", parent, sprite);
            SetAnchors(image.rectTransform, new Vector2(minX, minY), new Vector2(maxX, maxY));
            image.preserveAspect = true;
            image.raycastTarget = false;
        }

        private static Camera CreateCamera(string name, Color color, float size)
        {
            var go = new GameObject(name, typeof(Camera));
            go.tag = "MainCamera";
            var camera = go.GetComponent<Camera>();
            camera.orthographic = true;
            camera.orthographicSize = size;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = color;
            camera.nearClipPlane = .1f;
            camera.farClipPlane = 100f;
            return camera;
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
            Stretch(rect);
            return rect;
        }

        private static Text CreateText(
            string name,
            Transform parent,
            string value,
            int fontSize,
            TextAnchor alignment,
            Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var text = go.GetComponent<Text>();
            text.text = value;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = fontSize;
            text.fontStyle = FontStyle.Bold;
            text.alignment = alignment;
            text.color = color;
            text.horizontalOverflow = HorizontalWrapMode.Overflow;
            text.verticalOverflow = VerticalWrapMode.Overflow;
            Stretch(go.GetComponent<RectTransform>());
            return text;
        }

        private static GameObject CreateTextButton(
            string name,
            Transform parent,
            string label,
            int fontSize,
            Color textColor,
            Color background)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);

            var image = go.GetComponent<Image>();
            image.color = background;

            var text = CreateText("Label", go.transform, label, fontSize, TextAnchor.MiddleCenter, textColor);
            text.raycastTarget = false;

            return go;
        }

        private static GameObject CreateSpriteButton(
            string name,
            Transform parent,
            Sprite sprite,
            Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            image.sprite = sprite;
            image.color = color;
            image.preserveAspect = true;
            return go;
        }

        private static Image CreateUiImage(string name, Transform parent, Sprite sprite)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            image.sprite = sprite;
            image.color = Color.white;
            image.preserveAspect = true;
            Stretch(image.rectTransform);
            return image;
        }

        private static Sprite LoadSprite(string fileName)
        {
            var sprite = AssetDatabase.LoadAssetAtPath<Sprite>($"{ArtRoot}/{fileName}");
            if (sprite == null)
                throw new InvalidOperationException($"Missing installed reference sprite: {fileName}");
            return sprite;
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path))
                return;

            Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), path));
            AssetDatabase.Refresh();
        }

        private static void SetAnchors(RectTransform rect, Vector2 min, Vector2 max)
        {
            rect.anchorMin = min;
            rect.anchorMax = max;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void EnsureEventSystem()
        {
            if (UnityEngine.Object.FindFirstObjectByType<EventSystem>() != null)
                return;

            new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
        }
    }
}
#endif
