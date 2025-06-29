// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Foundation
import SwiftUI

struct AttachmentButton: View {
      @State private var showFileImporter = false
      var handlePickedFile: (URL) -> Void


      var body: some View {
          Button(action: {
              showFileImporter = true
          }) {
              Image(systemName: "paperclip")
                  .font(.title2)
                  .foregroundColor(.blue)
                  .clipShape(Circle())
          }
          .fileImporter(
              isPresented: $showFileImporter,
              allowedContentTypes: [.item]
          ) { result in
              switch result {
              case .success(let file):
                  // gain access to the directory
                  print("AttachmentButton: Successfully selected file: \(file.lastPathComponent), size: \(try? file.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0) bytes")
                  let gotAccess = file.startAccessingSecurityScopedResource()
                  if !gotAccess {
                      print("AttachmentButton: Failed to get security-scoped access to file: \(file.lastPathComponent)")
                      return
                  }
                  // access the directory URL
                  // (read templates in the directory, make a bookmark, etc.)
                  print("AttachmentButton: Calling handlePickedFile with file: \(file.lastPathComponent)")
                  handlePickedFile(file)
              case .failure(let error):
                  // handle error
                  print(error)
              }
          }
      }
  }
