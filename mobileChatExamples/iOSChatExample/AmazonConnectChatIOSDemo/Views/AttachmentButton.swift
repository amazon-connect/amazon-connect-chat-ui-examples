// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

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
                  let gotAccess = file.startAccessingSecurityScopedResource()
                  if !gotAccess { return }
                  // access the directory URL
                  // (read templates in the directory, make a bookmark, etc.)
                  handlePickedFile(file)
              case .failure(let error):
                  // handle error
                  print(error)
              }
          }
      }
  }
