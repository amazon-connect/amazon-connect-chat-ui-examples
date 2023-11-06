//
//  TypingIndicator.swift
//  Chat
//
//  Created by Mittal, Rajat on 11/1/23.
//

import SwiftUI

struct TypingIndicator: View {
    @State private var numberOfTheAnimationgBall = 3
    
    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            ForEach(0..<3) { i in
                Capsule()
                    .foregroundColor((self.numberOfTheAnimationgBall == i) ? .gray : Color(UIColor.white))
                    .frame(width: self.ballSize, height: self.ballSize)
            }
        }.padding(12)
            .background(Color(UIColor.lightGray).clipShape(RoundedRectangle(cornerRadius:24)))
            .animation(.spring(response: 0.5, dampingFraction: 0.7, blendDuration: 0.1).speed(2),value: 1)
            .onAppear {
                Timer.scheduledTimer(withTimeInterval: self.speed, repeats: true) { _ in
                    var randomNumb: Int
                    repeat {
                        randomNumb = Int.random(in: 0...2)
                    } while randomNumb == self.numberOfTheAnimationgBall
                    self.numberOfTheAnimationgBall = randomNumb
                }
            }
    }
    
    let ballSize: CGFloat = 8
    let speed: Double = 0.3
}

#Preview {
    TypingIndicator()
}


