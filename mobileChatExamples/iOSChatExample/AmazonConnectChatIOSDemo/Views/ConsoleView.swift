import SwiftUI

struct ConsoleView: View {
    @ObservedObject var logger = ConsoleLogger.shared
    @State private var autoScroll = true
    @State private var searchText = ""
    
    var filteredLogs: [ConsoleLogger.LogEntry] {
            if searchText.isEmpty {
                return logger.logs
            }
            return logger.logs.filter { $0.message.localizedCaseInsensitiveContains(searchText) }
        }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Debug Console")
                    .font(.headline)
                
                Spacer()
                
                Button(action: { logger.clear() }) {
                    Image(systemName: "trash")
                        .foregroundColor(.red)
                }
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            
            // Search bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.gray)
                TextField("Filter logs...", text: $searchText)
                    .textFieldStyle(PlainTextFieldStyle())
                
                if !searchText.isEmpty {
                    Button(action: { searchText = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            .background(Color(UIColor.tertiarySystemBackground))
            
            Divider()
            
            // Logs
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 4) {
                        ForEach(filteredLogs) { entry in
                            LogEntryView(entry: entry)
                                .id(entry.id)
                        }
                    }
                    .padding()
                }
                .onChange(of: logger.logs.count) { _ in
                    if autoScroll, let lastLog = logger.logs.last {
                        withAnimation {
                            proxy.scrollTo(lastLog.id, anchor: .bottom)
                        }
                    }
                }
            }
            .background(Color(UIColor.systemBackground))
            
            // Footer
            HStack {
                Text("\(filteredLogs.count) logs")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                if !searchText.isEmpty {
                    Text("(filtered from \(logger.logs.count))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                                
                Spacer()
                
                Toggle("Auto-scroll", isOn: $autoScroll)
                    .labelsHidden()
                    .toggleStyle(SwitchToggleStyle(tint: .blue))
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
        }
    }
}
