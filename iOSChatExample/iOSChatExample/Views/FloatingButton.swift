//
//  FloatingButton.swift
//  Chat
//
//  Created by Mittal, Rajat on 11/1/23.
//

import SwiftUI

struct FloatingButton: View {
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            Image(systemName: "message")
                .font(.title.weight(.semibold))
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .clipShape(Circle())
                .shadow(radius: 4, x: 0, y: 4)
        }
        .padding()
    }
}

