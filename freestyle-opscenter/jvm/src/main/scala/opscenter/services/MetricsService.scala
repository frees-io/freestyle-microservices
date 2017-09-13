/*
 * Copyright 2017 47 Degrees, LLC. <http://www.47deg.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package freestyle
package opscenter
package services

import akka.stream.scaladsl.{Flow, Sink, Source}
import akka.stream.ActorMaterializer
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.http.scaladsl.model.ws.BinaryMessage
import freestyle.opscenter.model.Metric
import scala.io.{Source => SourceIO}

object MetricsService {

  def greeterWebSocketService(implicit mat: ActorMaterializer) =
    Flow[Message]
      .mapConcat {
        case tm: TextMessage => readMetrics
        case bm: BinaryMessage => {
          bm.dataStream.runWith(Sink.ignore)
          Nil
        }
      }

  def readMetrics(implicit materializer: ActorMaterializer): List[TextMessage] = {
    val fileStream = getClass.getResourceAsStream("/metrics.txt")
    SourceIO.fromInputStream(fileStream).getLines.toList.map(lineToTextMessage)
  }

  private def lineToTextMessage(line: String): TextMessage = {
    val columns = line.split(" ")
    TextMessage(
      Source.single(Metric[Float](columns(1), columns(2).toFloat, columns(0).toLong).toString)
    )
  }

}
