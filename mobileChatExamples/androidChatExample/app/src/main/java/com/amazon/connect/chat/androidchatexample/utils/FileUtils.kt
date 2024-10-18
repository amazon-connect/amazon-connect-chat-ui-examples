package com.amazon.connect.chat.androidchatexample.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import android.webkit.MimeTypeMap
import androidx.core.content.FileProvider
import java.io.File
import java.io.IOException
import java.net.URL

object FileUtils {

    fun Uri.getOriginalFileName(context: Context): String? {
        return context.contentResolver.query(this, null, null, null, null)?.use {
            val nameColumnIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            it.moveToFirst()
            it.getString(nameColumnIndex)
        }
    }

    private fun getMimeType(fileName: String): String {
        val extension = fileName.substringAfterLast('.', "")
        return MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: "*/*"
    }

    fun previewFileFromCacheOrDownload(
        context: Context,
        fileUrl: URL,
        fileName: String
    ) {
        val tempDir = File(context.cacheDir, "attachments")
        if (!tempDir.exists()) {
            tempDir.mkdirs()
        }

        val file = File(tempDir, fileName)

        // Check if the file already exists in the cache
        if (file.exists()) {
            // File exists, use it for preview
            val fileUri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
            previewFile(context, fileUri, getMimeType(file.name))
        } else {
            // File doesn't exist, download and then preview
            downloadFileAndPreview(context, fileUrl, file)
        }
    }

    // Function to download the file and preview it
    private fun downloadFileAndPreview(context: Context, fileUrl: URL, file: File) {
        try {
            val connection = fileUrl.openConnection()
            connection.connect()

            file.outputStream().use { output ->
                connection.getInputStream().use { input ->
                    input.copyTo(output)
                }
            }

            // Use FileProvider to get the URI for the downloaded file
            val fileUri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )

            // Preview the file using an intent
            previewFile(context, fileUri, getMimeType(file.name))
        } catch (e: IOException) {
            Log.e("AttachmentPreview", "Error downloading file: ${e.localizedMessage}")
        }
    }

    private fun previewFile(context: Context, fileUri: Uri, mimeType: String? = null) {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(fileUri, mimeType) // Adjust the MIME type based on the file type if known
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION) // Grant temporary read permission
        }

        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            Log.e("FilePreview", "No app found to open this file type: ${e.message}")
        }
    }

}