import SwiftUI
import Foundation
import UIKit

class MarkdownParser {

    private let boldPattern = "\\*\\*(.*?)\\*\\*"
    private let italicPattern = "\\_(.*?)\\_"
    let bulletListPattern = "^\\- (.+)$" // Simplistic pattern for bullet lists
    let numberedListPattern = "^(\\d+)\\. (.+)$" // Simplistic pattern for numbered lists

    private let linkPattern = "\\[(.*?)\\]\\((.*?)\\)"

    private var attributes: [NSAttributedString.Key: Any] = [
        .font: UIFont.systemFont(ofSize: 16),
        // Add other attributes you need
    ]

    init(attributes: [NSAttributedString.Key: Any] = [:]) {
        self.attributes = attributes
    }

    func parse(_ markdown: String) -> NSAttributedString {
        let attributedString = NSMutableAttributedString(string: markdown, attributes: attributes)

        applyPattern(boldPattern, to: attributedString, with: .bold)
        applyPattern(italicPattern, to: attributedString, with: .italic)
        applyLinks(linkPattern, to: attributedString)
        parseLists(markdown, in: attributedString)

        return attributedString
    }

    private func applyPattern(_ pattern: String, to attributedString: NSMutableAttributedString, with trait: UIFontDescriptor.SymbolicTraits) {
        let regex = try! NSRegularExpression(pattern: pattern)
        let range = NSRange(location: 0, length: attributedString.length)
        regex.enumerateMatches(in: attributedString.string, options: [], range: range) { match, _, _ in
            if let matchRange = match?.range(at: 1) {
                let font = attributedString.attribute(.font, at: matchRange.location, effectiveRange: nil) as? UIFont ?? UIFont.systemFont(ofSize: UIFont.systemFontSize)
                if let newFontDescriptor = font.fontDescriptor.withSymbolicTraits(trait) {
                    let newFont = UIFont(descriptor: newFontDescriptor, size: font.pointSize)
                    attributedString.addAttribute(.font, value: newFont, range: matchRange)
                }
                attributedString.replaceCharacters(in: match!.range, with: attributedString.attributedSubstring(from: matchRange))
            }
        }
    }

    private func applyLinks(_ pattern: String, to attributedString: NSMutableAttributedString) {
        let regex = try! NSRegularExpression(pattern: pattern)
        let range = NSRange(location: 0, length: attributedString.length)
        regex.enumerateMatches(in: attributedString.string, options: [], range: range) { match, _, _ in
            if let matchRange = match?.range(at: 0),
               let textRange = match?.range(at: 1),
               let urlRange = match?.range(at: 2),
               let urlString = Range(urlRange, in: attributedString.string).flatMap({ String(attributedString.string[$0]) }),
               let url = URL(string: urlString) {

                let linkText = attributedString.attributedSubstring(from: textRange).string
                let linkAttributedString = NSAttributedString(string: linkText, attributes: [.link: url])
                attributedString.replaceCharacters(in: matchRange, with: linkAttributedString)
            }
        }
    }
    
    private func parseLists(_ markdown: String, in attributedString: NSMutableAttributedString) {
        parseBulletLists(in: attributedString)
        parseNumberedLists(in: attributedString)
    }

    private func parseBulletLists(in attributedString: NSMutableAttributedString) {
        let bulletListRegex = try! NSRegularExpression(pattern: bulletListPattern, options: [])
        let bulletListMatches = bulletListRegex.matches(in: attributedString.string, options: [], range: NSRange(location: 0, length: attributedString.length))

        bulletListMatches.reversed().forEach { match in
            let wholeMatchRange = match.range(at: 0)

            if let bulletRange = Range(wholeMatchRange, in: attributedString.string) {
                let listItem = String(attributedString.string[bulletRange])
                let bulletString = "• " + listItem.trimmingCharacters(in: .whitespacesAndNewlines)
                let bulletAttributedString = NSAttributedString(string: bulletString, attributes: attributes)
                attributedString.replaceCharacters(in: wholeMatchRange, with: bulletAttributedString)
            }
        }
    }

    private func parseNumberedLists(in attributedString: NSMutableAttributedString) {
        let numberedListRegex = try! NSRegularExpression(pattern: numberedListPattern, options: [])
        let numberedListMatches = numberedListRegex.matches(in: attributedString.string, options: [], range: NSRange(location: 0, length: attributedString.length))

        numberedListMatches.reversed().forEach { match in
            let wholeMatchRange = match.range(at: 0)
            let numberRange = match.range(at: 1)

            if let numberedRange = Range(wholeMatchRange, in: attributedString.string),
               let numberMatchRange = Range(numberRange, in: attributedString.string) {
                var number = String(attributedString.string[numberMatchRange])
                number = number.trimmingCharacters(in: .whitespacesAndNewlines)
                let listItem = String(attributedString.string[numberedRange])
                let numberedString = "\(number) " + listItem.trimmingCharacters(in: .whitespacesAndNewlines)
                let numberedAttributedString = NSAttributedString(string: numberedString, attributes: attributes)
                attributedString.replaceCharacters(in: wholeMatchRange, with: numberedAttributedString)
            }
        }
    }


}

extension UIFontDescriptor.SymbolicTraits {
    static let bold = UIFontDescriptor.SymbolicTraits.traitBold
    static let italic = UIFontDescriptor.SymbolicTraits.traitItalic
}


private func convertMarkdownBulletListToAttributedString(_ string: String) -> NSAttributedString {
    let bulletPointPattern = "^(\\-\\s+.+)$"
    let regexOptions: NSRegularExpression.Options = [.anchorsMatchLines]
    guard let regex = try? NSRegularExpression(pattern: bulletPointPattern, options: regexOptions) else { return NSAttributedString(string: string) }
    
    let range = NSRange(location: 0, length: string.utf16.count)
    let attributedString = NSMutableAttributedString(string: string)
    let bulletAttributes: [NSAttributedString.Key: Any] = [.font: UIFont.systemFont(ofSize: 14)]
    
    regex.enumerateMatches(in: string, options: [], range: range) { match, _, _ in
        guard let matchRange = match?.range(at: 1) else { return }
        let bulletText = NSAttributedString(string: "• ", attributes: bulletAttributes)
        
        // Create a new range for the bullet point, which is one character back to account for the markdown hyphen
        let newRange = NSRange(location: matchRange.location, length: 1)
        
        // Replace the markdown hyphen with the bullet point
        attributedString.replaceCharacters(in: newRange, with: bulletText)
        
        // Set attributes for the rest of the text in the line
        let restOfLineRange = NSRange(location: matchRange.location + 2, length: matchRange.length - 2)
        attributedString.addAttributes(bulletAttributes, range: restOfLineRange)
    }
    
    return attributedString
}


// MARK: - SwiftUI View for NSAttributedString
struct AttributedText: UIViewRepresentable {
    var attributedString: NSAttributedString

    func makeUIView(context: Context) -> UITextView {
        let textView = UITextView()
        textView.isEditable = false
        textView.isScrollEnabled = false
        textView.backgroundColor = .clear
        return textView
    }

    func updateUIView(_ uiView: UITextView, context: Context) {
        uiView.attributedText = attributedString
    }
}

// MARK: - SwiftUI usage
struct TestView: View {
    var body: some View {
        let parser = MarkdownParser()
        let markdown = "- 324\n -254563 "
        let attributedString = parser.parse(markdown)

        AttributedText(attributedString: attributedString)
            .padding()
        
        AttributedText(attributedString: convertMarkdownBulletListToAttributedString(markdown))
            .padding()
    }
}

#Preview {
    TestView()
}
