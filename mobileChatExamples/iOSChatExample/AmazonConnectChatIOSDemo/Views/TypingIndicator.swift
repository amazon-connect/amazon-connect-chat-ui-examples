// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import SwiftUI

struct TypingIndicator: View {
    @State private var numberOfTheAnimatingBall = 3
    @State private var animate = false
    
    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            ForEach(0..<3) { i in
                Capsule()
                    .foregroundColor((self.numberOfTheAnimatingBall == i) ? Color(UIColor.darkGray).opacity(0.8) : Color(UIColor.gray).opacity(0.6))
                    .frame(width: self.ballSize, height: self.ballSize)
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color(hex: "#EDEDED"))
        )
        .onAppear {
            self.animate.toggle()
            Timer.scheduledTimer(withTimeInterval: self.speed, repeats: true) { _ in
                var randomNumb: Int
                repeat {
                    randomNumb = Int.random(in: 0...2)
                } while randomNumb == self.numberOfTheAnimatingBall
                self.numberOfTheAnimatingBall = randomNumb
            }
        }
    }
    
    let ballSize: CGFloat = 8
    let speed: Double = 0.3
    let waveHeight: CGFloat = 3
    let waveDelay: Double = 0.1
}

#Preview {
    TypingIndicator()
}


