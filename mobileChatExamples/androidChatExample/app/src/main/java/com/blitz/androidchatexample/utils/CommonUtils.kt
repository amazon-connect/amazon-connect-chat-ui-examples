package com.blitz.androidchatexample.utils

import android.view.ViewTreeObserver
import androidx.compose.foundation.text.ClickableText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.platform.LocalWindowInfo
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.sp
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class CommonUtils {
    companion object{
        fun formatTime(timeStamp: String): String {
            val utcFormatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }

            val date = utcFormatter.parse(timeStamp)
            return if (date != null) {
                val localFormatter = SimpleDateFormat("HH:mm", Locale.getDefault()).apply {
                    timeZone = TimeZone.getDefault()
                }
                localFormatter.format(date)
            } else {
                timeStamp
            }
        }

        @Composable
        fun keyboardAsState(): State<Boolean> {
            val view = LocalView.current
            var isImeVisible by remember { mutableStateOf(false) }
            DisposableEffect(LocalWindowInfo.current) {
                val listener = ViewTreeObserver.OnPreDrawListener {
                    isImeVisible = ViewCompat.getRootWindowInsets(view)
                        ?.isVisible(WindowInsetsCompat.Type.ime()) == true
                    true
                }
                view.viewTreeObserver.addOnPreDrawListener(listener)
                onDispose {
                    view.viewTreeObserver.removeOnPreDrawListener(listener)
                }
            }
            return rememberUpdatedState(isImeVisible)
        }

        @Composable
        fun MarkdownText(text: String, color: Color) {
            val annotatedString = buildAnnotatedString {
                // Set default text color to white
                withStyle(style = SpanStyle(color = color, fontSize = 18.sp),) {
                    var currentIndex = 0
                    val regex = """\*\*(.*?)\*\*|\[(.*?)\]\((.*?)\)""".toRegex()
                    regex.findAll(text).forEach { matchResult ->
                        val (beforeMatchIndex, matchIndex) = matchResult.range.first to matchResult.range.last + 1
                        // Add normal text
                        append(text.substring(currentIndex, beforeMatchIndex))
                        // Check match type (bold or link)
                        val (boldText, linkText, linkUrl) = matchResult.destructured
                        if (boldText.isNotEmpty()) {
                            // Bold text
                            withStyle(style = SpanStyle(fontWeight = FontWeight.Bold, color = color, fontSize = 18.sp)) {
                                append(boldText)
                            }
                        } else {
                            // Link
                            pushStringAnnotation(tag = "URL", annotation = linkUrl)
                            withStyle(style = SpanStyle(color = Color.Blue, textDecoration = TextDecoration.Underline, fontSize = 18.sp)) {
                                append(linkText)
                            }
                            pop()
                        }
                        currentIndex = matchIndex
                    }
                    // Add remaining text
                    append(text.substring(currentIndex))
                }
            }

            ClickableText(
                text = annotatedString,
                onClick = { offset ->
                    annotatedString.getStringAnnotations(tag = "URL", start = offset, end = offset)
                        .firstOrNull()?.let { annotation ->
                            println("Clicked URL: ${annotation.item}")
                        }
                }
            )
        }



    }


}