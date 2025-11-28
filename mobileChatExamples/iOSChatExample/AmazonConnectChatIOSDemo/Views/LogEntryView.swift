import SwiftUI

struct LogEntryView: View {
    let entry: ConsoleLogger.LogEntry
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Text("🔍")
                .font(.caption)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.message)
                    .font(.system(.caption, design: .monospaced))
                    .foregroundColor(.primary)
                
                Text(timeString(from: entry.timestamp))
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundColor(.secondary)
            }
        }
        .padding(8)
        .background(Color.gray.opacity(0.05))
        .cornerRadius(6)
    }
    
    private func timeString(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .medium
        return formatter.string(from: date)
    }
}
