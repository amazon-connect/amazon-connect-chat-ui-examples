//
//  AttachmentTextView.swift
//  iOSChatExample
//
//  Created by Mittal, Rajat on 6/17/24.
//

import SwiftUI

struct AttachmentTextView: View {
    @Binding var text: String
    @Binding var selectedFileUrl: URL?
    var onTyping: () -> Void
    var onRemoveAttachment: () -> Void
    
    var body: some View {
        VStack{
            if let fileUrl = selectedFileUrl {
                HStack{
                    Text(fileUrl.lastPathComponent)
                        .lineLimit(2)
                        .truncationMode(.middle)
                    Button(action: {onRemoveAttachment() }) {
                        Image(systemName: "xmark.circle").foregroundColor(.black)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.gray.opacity(0.2))
                .cornerRadius(6)
            }
            
            TextField("Type a message", text: $text)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .onChange(of: text){ new in
                    if !text.isEmpty {
                        onTyping()
                    }
                }
                .padding(0)
        }
        .padding(.top, selectedFileUrl != nil ? 8:0)

        .background(RoundedRectangle(cornerRadius: 10).stroke(Color.gray, lineWidth: 0.5))
        .cornerRadius(10)
    }
}

#Preview("No Attachment") {
    // Preview with no attachment
    AttachmentTextView(
        text: .constant(""),
        selectedFileUrl: .constant(nil),
        onTyping: {},
        onRemoveAttachment: {}
    )
    .previewLayout(.sizeThatFits)
    .padding()
}

#Preview("With Attachment")
{
    AttachmentTextView(
        text: .constant(""),
        selectedFileUrl: .constant(URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("sasdfasfsdafdsafdafdasfasdfasdfasfddsafdsfasdfafasdfasdfasdfample.pdf")),
        onTyping: {},
        onRemoveAttachment: {}
    )
    .previewLayout(.sizeThatFits)
    .padding()
}
