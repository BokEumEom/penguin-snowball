#if UNITY_EDITOR
using System;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace PenguinSnowball.EditorTools
{
    public static class ReferenceArtInstaller
    {
        private const string EncodedRoot = "Assets/Art/Base64";
        private const string OutputRoot = "Assets/Art/Generated";

        private static readonly string[] AssetNames =
        {
            "penguin_small_blue.png",
            "penguin_gentoo_blue.png",
            "penguin_chinstrap_blue.png",
            "penguin_emperor_blue.png",
            "penguin_king_blue.png",
            "igloo_home_blue.png",
            "igloo_battle_blue.png",
            "cloud.png",
            "snowball.png",
            "title_ko.png"
        };

        [MenuItem("Tools/Penguin Snowball/Install Reference Art")]
        public static void InstallFromMenu()
        {
            EnsureInstalled(true);
        }

        public static void EnsureInstalled(bool force = false)
        {
            Directory.CreateDirectory(Path.Combine(Application.dataPath, "Art/Generated"));

            foreach (var fileName in AssetNames)
            {
                var sourcePath = $"{EncodedRoot}/{fileName}.b64.txt";
                var outputPath = $"{OutputRoot}/{fileName}";
                var absoluteSource = Path.Combine(Directory.GetCurrentDirectory(), sourcePath);
                var absoluteOutput = Path.Combine(Directory.GetCurrentDirectory(), outputPath);

                if (!File.Exists(absoluteSource))
                {
                    Debug.LogWarning($"Missing encoded art source: {sourcePath}");
                    continue;
                }

                if (force || !File.Exists(absoluteOutput))
                {
                    var encoded = File.ReadAllText(absoluteSource).Trim();
                    File.WriteAllBytes(absoluteOutput, Convert.FromBase64String(encoded));
                    AssetDatabase.ImportAsset(outputPath, ImportAssetOptions.ForceSynchronousImport);
                }

                ConfigureSprite(outputPath);
            }

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }

        private static void ConfigureSprite(string path)
        {
            var importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer == null)
                return;

            var changed =
                importer.textureType != TextureImporterType.Sprite ||
                importer.spriteImportMode != SpriteImportMode.Single ||
                importer.mipmapEnabled ||
                importer.filterMode != FilterMode.Bilinear ||
                !importer.alphaIsTransparency;

            importer.textureType = TextureImporterType.Sprite;
            importer.spriteImportMode = SpriteImportMode.Single;
            importer.spritePixelsPerUnit = 100f;
            importer.alphaIsTransparency = true;
            importer.mipmapEnabled = false;
            importer.filterMode = FilterMode.Bilinear;
            importer.textureCompression = TextureImporterCompression.Uncompressed;

            if (changed)
                importer.SaveAndReimport();
        }
    }
}
#endif
