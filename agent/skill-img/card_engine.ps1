Add-Type -AssemblyName PresentationCore, PresentationFramework, WindowsBase, System.Xaml, System.Drawing

$code = @"
using System;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;

public class HighResCardEngine {
    public static void RenderCard(
        string artPath, 
        string titleText, 
        string leftSubText, 
        string rightTagText, 
        string bgColorHex, 
        string bannerColorHex, 
        string metaTextColorHex,
        string outputPath
    ) {
        int width = 520;
        int height = 840;

        Border card = new Border {
            Width = width,
            Height = height,
            CornerRadius = new CornerRadius(28),
            Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString(bgColorHex)),
            BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString(bannerColorHex)),
            BorderThickness = new Thickness(8),
            Padding = new Thickness(36, 40, 36, 24)
        };

        Grid grid = new Grid();
        grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(560) });
        grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(20) });
        grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(92) });
        grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(16) });
        grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(48) });

        // Frame
        Border frame = new Border {
            CornerRadius = new CornerRadius(24),
            Background = Brushes.White,
            BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString(bannerColorHex)),
            BorderThickness = new Thickness(4),
            ClipToBounds = true
        };
        
        Grid frameGrid = new Grid();
        if (File.Exists(artPath)) {
            BitmapImage bmp = new BitmapImage();
            bmp.BeginInit();
            bmp.UriSource = new Uri(artPath, UriKind.Absolute);
            bmp.CacheOption = BitmapCacheOption.OnLoad;
            bmp.EndInit();
            
            Image artImg = new Image {
                Source = bmp,
                Stretch = Stretch.UniformToFill
            };
            frameGrid.Children.Add(artImg);
        }

        // Glass reflection overlay
        Border glass = new Border();
        LinearGradientBrush glassGrad = new LinearGradientBrush {
            StartPoint = new Point(0, 0),
            EndPoint = new Point(1, 1)
        };
        glassGrad.GradientStops.Add(new GradientStop(Color.FromArgb(0, 255, 255, 255), 0.35));
        glassGrad.GradientStops.Add(new GradientStop(Color.FromArgb(50, 255, 255, 255), 0.42));
        glassGrad.GradientStops.Add(new GradientStop(Color.FromArgb(0, 255, 255, 255), 0.50));
        glassGrad.GradientStops.Add(new GradientStop(Color.FromArgb(35, 255, 255, 255), 0.65));
        glassGrad.GradientStops.Add(new GradientStop(Color.FromArgb(0, 255, 255, 255), 0.72));
        glass.Background = glassGrad;
        frameGrid.Children.Add(glass);

        frame.Child = frameGrid;
        Grid.SetRow(frame, 0);
        grid.Children.Add(frame);

        // Banner
        Border banner = new Border {
            CornerRadius = new CornerRadius(16),
            Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString(bannerColorHex)),
            Padding = new Thickness(16, 0, 16, 0)
        };
        Grid.SetRow(banner, 2);

        Grid bannerGrid = new Grid();
        TextBlock leftDot = new TextBlock { Text = "◆", FontSize = 18, Foreground = Brushes.White, VerticalAlignment = VerticalAlignment.Center, HorizontalAlignment = HorizontalAlignment.Left };
        TextBlock rightDot = new TextBlock { Text = "◆", FontSize = 18, Foreground = Brushes.White, VerticalAlignment = VerticalAlignment.Center, HorizontalAlignment = HorizontalAlignment.Right };
        
        double fontSize = 52;
        if (titleText.Length > 9) fontSize = 42;
        if (titleText.Length > 12) fontSize = 36;
        if (titleText.Length > 15) fontSize = 30;
        
        TextBlock title = new TextBlock {
            Text = titleText,
            FontFamily = new FontFamily("Segoe UI, Baloo 2, Fredoka, sans-serif"),
            FontWeight = FontWeights.ExtraBold,
            FontSize = fontSize,
            Foreground = Brushes.White,
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center
        };
        bannerGrid.Children.Add(leftDot);
        bannerGrid.Children.Add(rightDot);
        bannerGrid.Children.Add(title);
        banner.Child = bannerGrid;
        grid.Children.Add(banner);

        // Meta
        Grid meta = new Grid();
        Grid.SetRow(meta, 4);
        Color textCol = (Color)ColorConverter.ConvertFromString(metaTextColorHex);
        
        double subFontSize = 24;
        if (leftSubText.Length > 20) subFontSize = 20;
        if (leftSubText.Length > 26) subFontSize = 18;

        TextBlock vi = new TextBlock {
            Text = leftSubText,
            FontFamily = new FontFamily("Segoe UI, Nunito, sans-serif"),
            FontWeight = FontWeights.SemiBold,
            FontSize = subFontSize,
            Foreground = new SolidColorBrush(textCol),
            HorizontalAlignment = HorizontalAlignment.Left,
            VerticalAlignment = VerticalAlignment.Center
        };
        TextBlock count = new TextBlock {
            Text = rightTagText,
            FontFamily = new FontFamily("Segoe UI, Nunito, sans-serif"),
            FontWeight = FontWeights.ExtraBold,
            FontSize = 22,
            Foreground = new SolidColorBrush(textCol),
            HorizontalAlignment = HorizontalAlignment.Right,
            VerticalAlignment = VerticalAlignment.Center
        };
        meta.Children.Add(vi);
        meta.Children.Add(count);
        grid.Children.Add(meta);

        card.Child = grid;

        card.Measure(new Size(width, height));
        card.Arrange(new Rect(0, 0, width, height));
        card.UpdateLayout();

        RenderTargetBitmap rtb = new RenderTargetBitmap(width, height, 96, 96, PixelFormats.Pbgra32);
        rtb.Render(card);

        TransformedBitmap scaled = new TransformedBitmap(rtb, new ScaleTransform(0.5, 0.5));

        PngBitmapEncoder encoder = new PngBitmapEncoder();
        encoder.Frames.Add(BitmapFrame.Create(scaled));
        
        string dir = Path.GetDirectoryName(outputPath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) {
            Directory.CreateDirectory(dir);
        }

        using (FileStream fs = File.Create(outputPath)) {
            encoder.Save(fs);
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies PresentationCore, PresentationFramework, WindowsBase, System.Xaml, System.Drawing
