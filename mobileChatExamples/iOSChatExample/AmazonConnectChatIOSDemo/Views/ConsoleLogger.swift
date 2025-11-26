import SwiftUI

class ConsoleLogger: ObservableObject {
    @Published var logs: [LogEntry] = []
    static let shared = ConsoleLogger()
    
    private let maxLogs = 500
    
    struct LogEntry: Identifiable {
        let id = UUID()
        let timestamp: Date
        let message: String
    }
    
    func log(_ message: String) {
        DispatchQueue.main.async {
            let entry = LogEntry(timestamp: Date(), message: message)
            self.logs.append(entry)
            
            if self.logs.count > self.maxLogs {
                self.logs.removeFirst(self.logs.count - self.maxLogs)
            }
        }
    }
    
    func clear() {
        logs.removeAll()
    }
}

func print(_ items: Any..., separator: String = " ", terminator: String = "\n") {
    let output = items.map { "\($0)" }.joined(separator: separator)
    ConsoleLogger.shared.log(output)
    Swift.print(output, terminator: terminator) // Still print to Xcode console
}
