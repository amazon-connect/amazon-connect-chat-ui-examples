package com.amazon.connect.chat.androidchatexample.utils

import com.amazon.connect.chat.sdk.utils.logger.ChatSDKLogger
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileNotFoundException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import kotlin.io.path.Path
import kotlin.io.path.appendText
import kotlin.io.path.createFile
import kotlin.io.path.exists

class CustomLogger : ChatSDKLogger {
    private var outputFileDir: File? = null
    private val job = SupervisorJob()
    private val coroutineScope = CoroutineScope(job + Dispatchers.IO)

    private val currentTimeMillis = System.currentTimeMillis()
    private val loggerCreationDateAndTime = CommonUtils.formatDate(currentTimeMillis, false)

    override fun logVerbose(message: () -> String) {
        // Custom logging logic
        val logMessage = "VERBOSE: ${message()}"
        println(logMessage)
        coroutineScope.launch {
            writeToAppTempFile(logMessage)
        }
    }

    override fun logInfo(message: () -> String) {
        // Custom logging logic
        val logMessage = "INFO: ${message()}"
        println(logMessage)
        coroutineScope.launch {
            writeToAppTempFile(logMessage)
        }
    }

    override fun logDebug(message: () -> String) {
        // Custom logging logic
        val logMessage = "DEBUG: ${message()}"
        println(logMessage)
        coroutineScope.launch {
            writeToAppTempFile(logMessage)
        }

    }

    override fun logWarn(message: () -> String) {
        // Custom logging logic
        val logMessage = "WARN: ${message()}"
        println(logMessage)
        coroutineScope.launch {
            writeToAppTempFile(logMessage)
        }
    }

    override fun logError(message: () -> String) {
        // Custom logging logic
        val logMessage = "ERROR: ${message()}"
        println(logMessage)
        coroutineScope.launch {
            writeToAppTempFile(logMessage)
        }
    }

    fun setLogOutputDir(tempFile: File) {
        outputFileDir = tempFile
    }

    private suspend fun writeToAppTempFile(content: String): Result<Boolean> {
        return withContext(Dispatchers.IO) {
            runCatching {
                val currentTimeMillis = System.currentTimeMillis()
                val formattedDateTimeForLogs = CommonUtils.formatDate(currentTimeMillis, true)
                if (outputFileDir == null || !outputFileDir!!.exists() || !outputFileDir!!.isDirectory()) {
                    return@runCatching false
                }
                val filePath = Path(outputFileDir!!.absolutePath, "$loggerCreationDateAndTime-amazon-connect-logs.txt")

                if (!filePath.exists()) {
                    filePath.createFile()
                }

                filePath.appendText("[$formattedDateTimeForLogs] $content \n")
                true
            }
        }
    }
}
