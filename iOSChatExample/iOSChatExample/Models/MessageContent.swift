// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Foundation

// MARK: - MessageContent Protocol
protocol MessageContent {
    static func decode(from text: String) -> MessageContent?
}

// MARK: - Plain Text Content
struct PlainTextContent: MessageContent {
    let text: String

    static func decode(from text: String) -> MessageContent? {
        PlainTextContent(text: text)
    }
}

// MARK: - Generic Interactive Template
struct GenericInteractiveTemplate: Decodable {
    let templateType: String
    // Other properties common to all interactive message types, if any
}

// MARK: - Interactive Content Protocol
protocol InteractiveContent: MessageContent {
    static var templateType: String { get }
}

// MARK: - Quick Reply Content
struct QuickReplyElement: Codable {
    let title: String
}

struct QuickReplyContentData: Codable {
    let title: String
    let subtitle: String?
    let elements: [QuickReplyElement]
}

struct QuickReplyData: Codable {
    let content: QuickReplyContentData
}

struct QuickReplyTemplate: Codable {
    let templateType: String
    let version: String
    let data: QuickReplyData
}

struct QuickReplyContent: InteractiveContent {
    static let templateType = "QuickReply" // This should match the templateType value for Quick Replies in the JSON

    let title: String
    let subtitle: String?
    let options: [String]

    static func decode(from text: String) -> MessageContent? {
        guard let jsonData = text.data(using: .utf8) else { return nil }
        do {
            let quickReply = try JSONDecoder().decode(QuickReplyTemplate.self, from: jsonData)
            let options = quickReply.data.content.elements.map { $0.title }
            let title = quickReply.data.content.title
            let subtitle = quickReply.data.content.subtitle
            return QuickReplyContent(title: title, subtitle: subtitle, options: options)
        } catch {
            print("Error decoding QuickReplyContent: \(error)")
            return nil
        }
    }
}

// MARK: - List Picker Content

struct ListPickerElement: Codable, Hashable, Equatable {    
    let title: String
    let subtitle: String?
    let imageType: String?
    let imageData: String?
}

struct ListPickerContentData: Codable {
    let title: String
    let subtitle: String?
    let imageType: String?
    let imageData: String?
    let elements: [ListPickerElement]
}

struct ListPickerData: Codable {
    let content: ListPickerContentData
}

struct ListPickerTemplate: Codable {
    let templateType: String
    let version: String
    let data: ListPickerData
}

struct ListPickerContent: InteractiveContent {
    static let templateType = "ListPicker" // This should match the templateType value for List Pickers in the JSON

    let title: String
    let subtitle: String?
    let imageUrl: String?
    let options: [ListPickerElement]

    static func decode(from text: String) -> MessageContent? {
        guard let jsonData = text.data(using: .utf8) else { return nil }
        do {
            let listPicker = try JSONDecoder().decode(ListPickerTemplate.self, from: jsonData)
            let title = listPicker.data.content.title
            let subtitle = listPicker.data.content.subtitle
            let options = listPicker.data.content.elements
            let imageUrl = listPicker.data.content.imageData
            return ListPickerContent(title: title, subtitle: subtitle, imageUrl: imageUrl, options: options)
        } catch {
            print("Error decoding ListPickerContent: \(error)")
            return nil
        }
    }
}


// MARK: - Additional Interactive Content Types
// Add additional structs here following the pattern of QuickReplyContent for each new type of interactive content.
