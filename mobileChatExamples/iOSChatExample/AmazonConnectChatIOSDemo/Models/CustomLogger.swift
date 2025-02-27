// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Foundation
import AmazonConnectChatIOS

class CustomLogger: SDKLoggerProtocol {
    private var outputDir: URL
    private var loggerCreationDateAndTime: String
    
    init() {
        self.outputDir = FileManager.default.temporaryDirectory
        
        let currentDate = Date()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd_HH-mm"
        self.loggerCreationDateAndTime = dateFormatter.string(from: currentDate)
    }
    
    func logVerbose(_ message: @autoclosure () -> String) {
        let logMessage = "VERBOSE: \(message())"
        print(logMessage)
        writeToAppTempFile(content: logMessage)
    }
    
    func logInfo(_ message: @autoclosure () -> String) {
        let logMessage = "INFO: \(message())"
        print(logMessage)
        writeToAppTempFile(content: logMessage)
    }
    
    func logDebug(_ message: @autoclosure () -> String) {
        let logMessage = "DEBUG: \(message())"
        print(logMessage)
        writeToAppTempFile(content: logMessage)
    }
    
    func logFault(_ message: @autoclosure () -> String) {
        let logMessage = "FAULT: \(message())"
        print(logMessage)
        writeToAppTempFile(content: logMessage)
    }
    
    func logError(_ message: @autoclosure () -> String) {
        let logMessage = "ERROR: \(message())"
        print(logMessage)
        writeToAppTempFile(content: logMessage)
    }
    
    func setOutputFileDir(to directory: URL) {
        outputDir = directory
    }
    
    func writeToAppTempFile(content: String) -> Void {
        DispatchQueue.global(qos: .background).async {
            do {
                let fileName = "\(self.loggerCreationDateAndTime)-amazon-connect-logs.txt"
                let filePath = self.outputDir.appendingPathComponent(fileName)
                
                if !FileManager.default.fileExists(atPath: filePath.path) {
                    // Create the file if it doesn't exist
                    FileManager.default.createFile(atPath: filePath.path, contents: nil, attributes: nil)
                }
                
                // Append content to the file
                let fileHandle = try FileHandle(forWritingTo: filePath)
                defer { fileHandle.closeFile() }

                // Move to the end of the file before appending
                fileHandle.seekToEndOfFile()
                let timestamp = Date().description
                if let data = "[\(timestamp)] \(content) \n".data(using: .utf8) {
                    fileHandle.write(data)
                }
            } catch {
                print("ERROR")
            }
        }
    }
}
