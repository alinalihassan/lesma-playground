#include <cstdio>
#include <memory>
#include <stdexcept>
#include <string>
#include <array>

#include "crow.h"
#include "liblesma/Driver/Driver.h"

struct Response {
    double time;
    std::string message;
};

Response exec(const std::string& filename) {
    std::array<char, 128> buffer{};
    std::string result;
    auto start = std::chrono::system_clock::now();
    std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(fmt::format("./{}", filename).c_str(), "r"), pclose);
    if (!pipe) {
        throw std::runtime_error("popen() failed!");
    }

    auto end = std::chrono::system_clock::now();
    std::chrono::duration<double> elapsed_seconds = end - start;
    auto time = elapsed_seconds.count() * 1000;
    CROW_LOG_DEBUG << "Time in chrono" << time << "\n";

    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr)
        result += buffer.data();

    remove(filename.c_str());
    
    return {time, result};
}

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/run").methods("POST"_method)([](const crow::request& req){
        std::string output_filename = std::to_string(rand());
        lesma::Driver::Compile(new lesma::Options{
            lesma::SourceType::STRING,
//            "print(\"Hello from lesma!\")",
            req.body,
            lesma::Debug::NONE,
            output_filename,
            true
        });
        Response output = exec(output_filename);
        CROW_LOG_DEBUG << "Output: " << output.message << "\n";

        std::vector<crow::json::wvalue> events;
        events.push_back({{"Message", output.message}, {"Kind", "stdout"}, {"Delay", output.time}});
        crow::json::wvalue x({{"events", events}});
        return x;
    });

    app.port(18080).multithreaded().run();
}