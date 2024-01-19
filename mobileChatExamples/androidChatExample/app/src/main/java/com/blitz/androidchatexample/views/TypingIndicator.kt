package com.blitz.androidchatexample.views

import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.keyframes
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp

@Composable
fun TypingIndicator() {
    val ballSize = 8.dp
    val animationDuration = 300
    val numberOfBalls = 3

    // Create an infinite transition that repeats the animation
    val infiniteTransition = rememberInfiniteTransition(label = "")
    val ballAnimations = List(numberOfBalls) { index ->
        infiniteTransition.animateFloat(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = keyframes {
                    durationMillis = animationDuration * numberOfBalls
                    0f at animationDuration * index with LinearOutSlowInEasing
                    1f at animationDuration * index + animationDuration / 2 with LinearOutSlowInEasing
                },
                repeatMode = RepeatMode.Reverse
            ), label = ""
        )
    }

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .padding(10.dp)
            .background(Color.LightGray, RoundedCornerShape(24.dp))
            .padding( start = 10.dp)
            .padding( end = 5.dp)
            .padding( top = 10.dp)
            .padding( bottom = 10.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            ballAnimations.forEach { anim ->
                Box(
                    modifier = Modifier
                        .size(ballSize)
                        .graphicsLayer {
                            // Scale up the ball size based on the animated value
                            scaleX = 1f + anim.value * 0.5f
                            scaleY = 1f + anim.value * 0.5f
                        }
                        .background(Color.Gray, RoundedCornerShape(50))
                )
                Spacer(modifier = Modifier.width(6.dp))
            }
        }
    }
}

